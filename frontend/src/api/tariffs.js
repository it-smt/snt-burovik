import api from "@/api";
export const tariffsApi = {
    async getAll() {
        return api.get("/tariffs");
    },
    async create(data) {
        return api.post("/tariffs", data);
    },
    async update(id, data) {
        return api.patch(`/tariffs/${id}`, data);
    },
    async delete(id) {
        await api.delete(`/tariffs/${id}`);
    },
};
