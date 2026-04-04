import api from "@/api";
export const usersApi = {
    async getAll(params) {
        return api.get("/users", { params });
    },
    async getById(id) {
        return api.get(`/users/${id}`);
    },
    async create(data) {
        return api.post("/users", data);
    },
    async update(id, data) {
        return api.patch(`/users/${id}`, data);
    },
    async delete(id) {
        await api.delete(`/users/${id}`);
    },
    async resetPassword(id) {
        return api.post(`/users/${id}/reset-password`);
    },
};
