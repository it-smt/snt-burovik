import api from "@/api";
export const reportsApi = {
    async getFinancialSummary() {
        return api.get("/reports/summary");
    },
    async getDebtors() {
        return api.get("/reports/debtors");
    },
    async getAllBalances() {
        return api.get("/reports/balances");
    },
    async getPeriodSummaries() {
        return api.get("/reports/periods");
    },
};
