// src/api/auth.ts

import type { AuthResponse, LoginRequest, User } from "@/types";

// Мок-пользователи для тестирования
const mockUsers: Record<string, User & { password: string }> = {
  "owner@test.ru": {
    id: 1,
    email: "owner@test.ru",
    full_name: "Иванов Иван Иванович",
    phone: "+7 900 123-45-67",
    role: "owner",
    is_active: true,
    password: "123456",
  },
  "chairman@test.ru": {
    id: 2,
    email: "chairman@test.ru",
    full_name: "Петров Пётр Петрович",
    phone: "+7 900 765-43-21",
    role: "chairman",
    is_active: true,
    password: "123456",
  },
  "accountant@test.ru": {
    id: 3,
    email: "accountant@test.ru",
    full_name: "Сидорова Анна Сергеевна",
    phone: "+7 900 111-22-33",
    role: "accountant",
    is_active: true,
    password: "123456",
  },
};

export const authApi = {
  async login(data: LoginRequest): Promise<{ data: AuthResponse }> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers[data.email];

    if (!user || user.password !== data.password) {
      throw {
        response: {
          status: 401,
          data: { detail: "Неверный email или пароль" },
        },
      };
    }

    const { password, ...userWithoutPassword } = user;

    return {
      data: {
        access_token: "mock-token-" + user.id,
        token_type: "bearer",
        user: userWithoutPassword,
      },
    };
  },

  async me(): Promise<{ data: User }> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const token = localStorage.getItem("access_token");
    if (!token) {
      throw { response: { status: 401 } };
    }

    const userId = parseInt(token.replace("mock-token-", ""));
    const user = Object.values(mockUsers).find((u) => u.id === userId);

    if (!user) {
      throw { response: { status: 401 } };
    }

    const { password, ...userWithoutPassword } = user;
    return { data: userWithoutPassword };
  },

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
  },
};
