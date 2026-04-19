import api from "@/api";
export const announcementsApi = {
    async getAll(params) {
        return api.get("/announcements", { params });
    },
    async create(data) {
        return api.post("/announcements", data);
    },
    async delete(id) {
        await api.delete(`/announcements/${id}`);
    },
};
