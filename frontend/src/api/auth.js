import api from "@/api";
export const authApi = {
    async login(data) {
        return api.post("/auth/login", data);
    },
    async me() {
        return api.get("/auth/me");
    },
    async logout() {
        return Promise.resolve();
    },
};
