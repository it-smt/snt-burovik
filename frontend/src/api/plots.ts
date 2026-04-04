import api from "@/api";
import type { PaginatedResponse, Plot, PlotBalance } from "@/types";

export interface CreatePlotData {
  number: string;
  area_sqm: number;
  cadastral_number?: string;
  address: string;
  owner_id?: number | null;
  has_electricity: boolean;
  has_water: boolean;
}

export interface UpdatePlotData extends Partial<CreatePlotData> {}

export const plotsApi = {
  async getAll(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    has_owner?: boolean;
  }): Promise<{ data: PaginatedResponse<Plot> }> {
    return api.get("/plots", { params });
  },

  async getById(id: number): Promise<{ data: Plot }> {
    return api.get(`/plots/${id}`);
  },

  async create(data: CreatePlotData): Promise<{ data: Plot }> {
    return api.post("/plots", data);
  },

  async update(id: number, data: UpdatePlotData): Promise<{ data: Plot }> {
    return api.patch(`/plots/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/plots/${id}`);
  },

  async getMyPlots(): Promise<{ data: Plot[] }> {
    return api.get("/plots/my");
  },

  async getBalance(plotId: number): Promise<{ data: PlotBalance }> {
    return api.get(`/plots/${plotId}/balance`);
  },

  async getAllBalances(): Promise<{ data: PlotBalance[] }> {
    return api.get("/plots/balances");
  },

  async getOwnersList(): Promise<{
    data: { id: number; full_name: string }[];
  }> {
    return api.get("/plots/owners");
  },
};
