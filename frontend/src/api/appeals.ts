import api from "@/api";
import type { Appeal, PaginatedResponse } from "@/types";

export interface AppealStats {
  new_count: number;
  in_progress_count: number;
}

export const appealsApi = {
  async getAll(params?: {
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ data: PaginatedResponse<Appeal> }> {
    return api.get("/appeals", { params });
  },

  async getById(id: number): Promise<{ data: Appeal }> {
    return api.get(`/appeals/${id}`);
  },

  async create(
    data: Pick<Appeal, "plot_id" | "subject" | "message">,
  ): Promise<{ data: Appeal }> {
    return api.post("/appeals", data);
  },

  async respond(
    id: number,
    data: { response: string; status: Appeal["status"] },
  ): Promise<{ data: Appeal }> {
    return api.post(`/appeals/${id}/respond`, data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/appeals/${id}`);
  },

  async getStats(): Promise<{ data: AppealStats }> {
    return api.get("/appeals/stats");
  },
};
