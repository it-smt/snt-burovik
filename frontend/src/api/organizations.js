// src/api/organizations.ts
export const organizationsApi = {
    async get() {
        const { api } = await import("./index");
        return api.get("/organization");
    },
    async update(data) {
        const { api } = await import("./index");
        return api.patch("/organization", data);
    },
};
