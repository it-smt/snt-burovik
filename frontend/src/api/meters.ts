import api from "@/api";
import type { MeterReading } from "@/types";

export interface MeterStats {
  unverified_count: number;
}

export const metersApi = {
  async getReadings(params?: {
    plot_id?: number;
  }): Promise<{ data: MeterReading[] }> {
    return api.get("/meters", { params });
  },

  async submitReading(
    data: Omit<MeterReading, "id" | "is_verified" | "submitted_by">,
  ): Promise<{ data: MeterReading }> {
    return api.post("/meters", data);
  },

  async verifyReading(id: number): Promise<{ data: MeterReading }> {
    return api.post(`/meters/${id}/verify`);
  },

  async getStats(): Promise<{ data: MeterStats }> {
    return api.get("/meters/stats");
  },
};
