// src/types/index.ts

export type UserRole = "owner" | "chairman" | "accountant" | "admin";

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
}

export interface Plot {
  id: number;
  number: string; // "A-15"
  area_sqm: number; // площадь в м²
  cadastral_number?: string;
  address: string;
  owner_id: number;
  owner?: User;
  has_electricity: boolean;
  has_water: boolean;
  created_at: string;
}

export interface MeterReading {
  id: number;
  plot_id: number;
  meter_type: "electricity" | "water_cold" | "water_hot";
  value: number;
  reading_date: string;
  submitted_by: number;
  photo_url?: string;
  is_verified: boolean;
}

export interface Tariff {
  id: number;
  name: string;
  type: "membership" | "targeted" | "electricity" | "water" | "garbage";
  rate: number; // ставка
  unit: string; // "кВт·ч", "м³", "сотка", "участок"
  effective_from: string;
  effective_to?: string;
}

export interface Charge {
  id: number;
  plot_id: number;
  plot?: Plot;
  tariff_id: number;
  tariff?: Tariff;
  period: string; // "2025-01"
  amount: number;
  description: string;
  created_at: string;
}

export interface Payment {
  id: number;
  plot_id: number;
  plot?: Plot;
  amount: number;
  payment_date: string;
  payment_method: "cash" | "bank_transfer" | "card" | "qr";
  receipt_number?: string;
  description: string;
  recorded_by: number;
  created_at: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  is_important: boolean;
  author_id: number;
  author?: User;
  published_at: string;
  expires_at?: string;
}

export interface Appeal {
  id: number;
  plot_id: number;
  plot?: Plot;
  subject: string;
  message: string;
  status: "new" | "in_progress" | "resolved" | "rejected";
  response?: string;
  created_at: string;
  resolved_at?: string;
}

export interface PlotBalance {
  plot_id: number;
  plot_number: string;
  owner_name: string;
  total_charged: number;
  total_paid: number;
  balance: number; // отрицательный = долг
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  user_name: string;
  action: string;
  entity_type:
    | "user"
    | "plot"
    | "payment"
    | "charge"
    | "meter"
    | "announcement"
    | "appeal";
  entity_id: number;
  entity_name: string;
  details?: string;
  created_at: string;
}
