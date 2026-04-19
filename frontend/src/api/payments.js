import api from "@/api";
export const paymentsApi = {
    async getCharges(params) {
        return api.get("/payments/charges", { params });
    },
    async createCharge(data) {
        return api.post("/payments/charges", data);
    },
    async createMassCharge(data) {
        return api.post("/payments/charges/mass", data);
    },
    async getPayments(params) {
        return api.get("/payments/payments", { params });
    },
    async createPayment(data) {
        return api.post("/payments/payments", data);
    },
};
