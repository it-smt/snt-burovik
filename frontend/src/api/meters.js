import api from "@/api";
export const metersApi = {
    async getReadings(params) {
        return api.get("/meters", { params });
    },
    async submitReading(data) {
        return api.post("/meters", data);
    },
    async verifyReading(id) {
        return api.post(`/meters/${id}/verify`);
    },
    async getStats() {
        return api.get("/meters/stats");
    },
};
