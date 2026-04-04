import api from "@/api";
export const plotsApi = {
    async getAll(params) {
        return api.get("/plots", { params });
    },
    async getById(id) {
        return api.get(`/plots/${id}`);
    },
    async create(data) {
        return api.post("/plots", data);
    },
    async update(id, data) {
        return api.patch(`/plots/${id}`, data);
    },
    async delete(id) {
        await api.delete(`/plots/${id}`);
    },
    async getMyPlots() {
        return api.get("/plots/my");
    },
    async getBalance(plotId) {
        return api.get(`/plots/${plotId}/balance`);
    },
    async getAllBalances() {
        return api.get("/plots/balances");
    },
    async getOwnersList() {
        return api.get("/plots/owners");
    },
};
