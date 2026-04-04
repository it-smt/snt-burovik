import api from "@/api";
import type { Announcement, PaginatedResponse } from "@/types";

export const announcementsApi = {
  async getAll(params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<{ data: PaginatedResponse<Announcement> }> {
    return api.get("/announcements", { params });
  },

  async create(
    data: Omit<Announcement, "id" | "published_at" | "author_id" | "author">,
  ): Promise<{ data: Announcement }> {
    return api.post("/announcements", data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/announcements/${id}`);
  },
};
