import api from "@/api";
import type { AuthResponse, LoginRequest, User } from "@/types";

export const authApi = {
  async login(data: LoginRequest): Promise<{ data: AuthResponse }> {
    return api.post("/auth/login", data);
  },

  async me(): Promise<{ data: User }> {
    return api.get("/auth/me");
  },

  async logout(): Promise<void> {
    return Promise.resolve();
  },
};
