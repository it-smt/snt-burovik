// src/api/organizations.ts
import api from "./index";
export const organizationsApi = {
    async get() {
        return api.get("/organization");
    },
    async update(data) {
        return api.patch("/organization", data);
    },
};
