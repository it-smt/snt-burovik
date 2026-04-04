import api from "@/api";
export const appealsApi = {
    async getAll(params) {
        return api.get("/appeals", { params });
    },
    async getById(id) {
        return api.get(`/appeals/${id}`);
    },
    async create(data) {
        return api.post("/appeals", data);
    },
    async respond(id, data) {
        return api.post(`/appeals/${id}/respond`, data);
    },
    async delete(id) {
        await api.delete(`/appeals/${id}`);
    },
    async getStats() {
        return api.get("/appeals/stats");
    },
};
