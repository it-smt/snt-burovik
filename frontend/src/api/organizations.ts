// src/api/organizations.ts

import type { Organization } from "@/types";

export const organizationsApi = {
  async get(): Promise<{ data: Organization }> {
    const { api } = await import("./index");
    return api.get("/organization");
  },

  async update(data: Partial<Organization>): Promise<{ data: Organization }> {
    const { api } = await import("./index");
    return api.patch("/organization", data);
  },
};
