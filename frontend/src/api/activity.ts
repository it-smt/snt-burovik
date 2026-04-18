// src/api/activity.ts

import type { ActivityLog } from "@/types";
import { api } from "./index";

export const activityApi = {
  async getRecent(limit = 20): Promise<{ data: ActivityLog[] }> {
    const response = await api.get(`/activity?limit=${limit}`);
    return response;
  },
};
