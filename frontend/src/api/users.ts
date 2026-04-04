import api from "@/api";
import type { PaginatedResponse, User, UserRole } from "@/types";

export interface CreateUserData {
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserData {
  email?: string;
  full_name?: string;
  phone?: string;
  role?: UserRole;
  is_active?: boolean;
}

export const usersApi = {
  async getAll(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    role?: UserRole;
  }): Promise<{ data: PaginatedResponse<User> }> {
    return api.get("/users", { params });
  },

  async getById(id: number): Promise<{ data: User }> {
    return api.get(`/users/${id}`);
  },

  async create(data: CreateUserData): Promise<{ data: User }> {
    return api.post("/users", data);
  },

  async update(id: number, data: UpdateUserData): Promise<{ data: User }> {
    return api.patch(`/users/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async resetPassword(
    id: number,
  ): Promise<{ data: { temp_password: string } }> {
    return api.post(`/users/${id}/reset-password`);
  },
};
