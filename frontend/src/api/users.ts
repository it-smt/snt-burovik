// src/api/users.ts

import type { PaginatedResponse, User, UserRole } from "@/types";

// Мок-данные пользователей
const mockUsers: User[] = [
  {
    id: 1,
    email: "owner@test.ru",
    full_name: "Иванов Иван Иванович",
    phone: "+7 900 123-45-67",
    role: "owner",
    is_active: true,
  },
  {
    id: 2,
    email: "chairman@test.ru",
    full_name: "Петров Пётр Петрович",
    phone: "+7 900 765-43-21",
    role: "chairman",
    is_active: true,
  },
  {
    id: 3,
    email: "accountant@test.ru",
    full_name: "Сидорова Анна Сергеевна",
    phone: "+7 900 111-22-33",
    role: "accountant",
    is_active: true,
  },
  {
    id: 4,
    email: "kozlov@mail.ru",
    full_name: "Козлов Сергей Викторович",
    phone: "+7 900 444-55-66",
    role: "owner",
    is_active: true,
  },
  {
    id: 5,
    email: "novikova@mail.ru",
    full_name: "Новикова Елена Павловна",
    phone: "+7 900 777-88-99",
    role: "owner",
    is_active: true,
  },
  {
    id: 6,
    email: "fedorov@mail.ru",
    full_name: "Фёдоров Алексей Николаевич",
    phone: "+7 900 222-33-44",
    role: "owner",
    is_active: false,
  },
];

let nextId = 7;

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
    await new Promise((r) => setTimeout(r, 300));

    let filtered = [...mockUsers];

    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.full_name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          u.phone.includes(s),
      );
    }

    if (params?.role) {
      filtered = filtered.filter((u) => u.role === params.role);
    }

    const page = params?.page || 1;
    const perPage = params?.per_page || 10;
    const start = (page - 1) * perPage;
    const items = filtered.slice(start, start + perPage);

    return {
      data: {
        items,
        total: filtered.length,
        page,
        per_page: perPage,
        pages: Math.ceil(filtered.length / perPage),
      },
    };
  },

  async getById(id: number): Promise<{ data: User }> {
    await new Promise((r) => setTimeout(r, 200));
    const user = mockUsers.find((u) => u.id === id);
    if (!user) throw { response: { status: 404 } };
    return { data: user };
  },

  async create(data: CreateUserData): Promise<{ data: User }> {
    await new Promise((r) => setTimeout(r, 400));

    if (mockUsers.some((u) => u.email === data.email)) {
      throw {
        response: {
          status: 400,
          data: { detail: "Пользователь с таким email уже существует" },
        },
      };
    }

    const newUser: User = {
      id: nextId++,
      email: data.email,
      full_name: data.full_name,
      phone: data.phone,
      role: data.role,
      is_active: true,
    };

    mockUsers.push(newUser);
    return { data: newUser };
  },

  async update(id: number, data: UpdateUserData): Promise<{ data: User }> {
    await new Promise((r) => setTimeout(r, 300));

    const user = mockUsers.find((u) => u.id === id);
    if (!user) throw { response: { status: 404 } };

    Object.assign(user, data);
    return { data: user };
  },

  async delete(id: number): Promise<void> {
    await new Promise((r) => setTimeout(r, 300));

    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) throw { response: { status: 404 } };

    mockUsers.splice(index, 1);
  },

  async resetPassword(
    id: number,
  ): Promise<{ data: { temp_password: string } }> {
    await new Promise((r) => setTimeout(r, 300));

    const user = mockUsers.find((u) => u.id === id);
    if (!user) throw { response: { status: 404 } };

    // Генерируем временный пароль
    const tempPassword = Math.random().toString(36).slice(-8);
    return { data: { temp_password: tempPassword } };
  },
};
