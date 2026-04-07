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
    async getMe() {
        return api.get("/users/me");
    },
    async updateMe(data) {
        return api.patch("/users/me", data);
    },
    async changePassword(data) {
        return api.post("/users/change-password", data);
    },
};
