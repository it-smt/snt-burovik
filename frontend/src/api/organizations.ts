// src/api/organizations.ts

import type { Organization } from "@/types";
import api from "./index";

export const organizationsApi = {
  async get(): Promise<{ data: Organization }> {
    return api.get("/organization");
  },

  async update(data: Partial<Organization>): Promise<{ data: Organization }> {
    return api.patch("/organization", data);
  },
};
