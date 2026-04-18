// src/api/activity.ts
import { api } from "./index";
export const activityApi = {
    async getRecent(limit = 20) {
        const response = await api.get(`/activity?limit=${limit}`);
        return response;
    },
};
