import api from "@/api";
import type { Tariff } from "@/types";

export const tariffsApi = {
  async getAll(): Promise<{ data: Tariff[] }> {
    return api.get("/tariffs");
  },

  async create(data: Omit<Tariff, "id">): Promise<{ data: Tariff }> {
    return api.post("/tariffs", data);
  },

  async update(id: number, data: Partial<Tariff>): Promise<{ data: Tariff }> {
    return api.patch(`/tariffs/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/tariffs/${id}`);
  },
};
