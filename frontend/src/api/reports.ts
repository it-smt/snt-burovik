// src/api/reports.ts

import type { PlotBalance } from "@/types";

export interface DebtorInfo {
  plot_id: number;
  plot_number: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  total_charged: number;
  total_paid: number;
  debt: number;
}

export interface PeriodSummary {
  period: string;
  total_charged: number;
  total_paid: number;
  total_debt: number;
  plots_count: number;
  paid_count: number;
  debt_count: number;
}

export interface FinancialSummary {
  total_plots: number;
  total_owners: number;
  total_charged: number;
  total_paid: number;
  total_debt: number;
  total_overpaid: number;
  collection_rate: number; // % собираемости
}

const mockDebtors: DebtorInfo[] = [
  {
    plot_id: 2,
    plot_number: "А-02",
    owner_name: "Козлов Сергей Викторович",
    owner_phone: "+7 900 444-55-66",
    owner_email: "kozlov@mail.ru",
    total_charged: 18000,
    total_paid: 10000,
    debt: 8000,
  },
  {
    plot_id: 5,
    plot_number: "Б-02",
    owner_name: "Иванов Иван Иванович",
    owner_phone: "+7 900 123-45-67",
    owner_email: "owner@test.ru",
    total_charged: 20000,
    total_paid: 5000,
    debt: 15000,
  },
];

const mockPeriods: PeriodSummary[] = [
  {
    period: "2025-01",
    total_charged: 75000,
    total_paid: 52000,
    total_debt: 23000,
    plots_count: 6,
    paid_count: 4,
    debt_count: 2,
  },
  {
    period: "2024-12",
    total_charged: 72000,
    total_paid: 68000,
    total_debt: 4000,
    plots_count: 6,
    paid_count: 5,
    debt_count: 1,
  },
  {
    period: "2024-11",
    total_charged: 70000,
    total_paid: 70000,
    total_debt: 0,
    plots_count: 6,
    paid_count: 6,
    debt_count: 0,
  },
  {
    period: "2024-10",
    total_charged: 71000,
    total_paid: 65000,
    total_debt: 6000,
    plots_count: 6,
    paid_count: 4,
    debt_count: 2,
  },
  {
    period: "2024-09",
    total_charged: 69000,
    total_paid: 69000,
    total_debt: 0,
    plots_count: 6,
    paid_count: 6,
    debt_count: 0,
  },
  {
    period: "2024-08",
    total_charged: 73000,
    total_paid: 71000,
    total_debt: 2000,
    plots_count: 6,
    paid_count: 5,
    debt_count: 1,
  },
];

const mockBalances: PlotBalance[] = [
  {
    plot_id: 1,
    plot_number: "А-01",
    owner_name: "Иванов И.И.",
    total_charged: 15000,
    total_paid: 15000,
    balance: 0,
  },
  {
    plot_id: 2,
    plot_number: "А-02",
    owner_name: "Козлов С.В.",
    total_charged: 18000,
    total_paid: 10000,
    balance: -8000,
  },
  {
    plot_id: 3,
    plot_number: "А-03",
    owner_name: "Новикова Е.П.",
    total_charged: 12000,
    total_paid: 12000,
    balance: 0,
  },
  {
    plot_id: 4,
    plot_number: "Б-01",
    owner_name: "— нет владельца —",
    total_charged: 0,
    total_paid: 0,
    balance: 0,
  },
  {
    plot_id: 5,
    plot_number: "Б-02",
    owner_name: "Иванов И.И.",
    total_charged: 20000,
    total_paid: 5000,
    balance: -15000,
  },
  {
    plot_id: 6,
    plot_number: "В-01",
    owner_name: "Фёдоров А.Н.",
    total_charged: 10000,
    total_paid: 10000,
    balance: 0,
  },
];

export const reportsApi = {
  async getFinancialSummary(): Promise<{ data: FinancialSummary }> {
    await new Promise((r) => setTimeout(r, 400));
    return {
      data: {
        total_plots: 6,
        total_owners: 5,
        total_charged: 75000,
        total_paid: 52000,
        total_debt: 23000,
        total_overpaid: 0,
        collection_rate: 69.3,
      },
    };
  },

  async getDebtors(): Promise<{ data: DebtorInfo[] }> {
    await new Promise((r) => setTimeout(r, 300));
    return { data: [...mockDebtors].sort((a, b) => b.debt - a.debt) };
  },

  async getAllBalances(): Promise<{ data: PlotBalance[] }> {
    await new Promise((r) => setTimeout(r, 300));
    return { data: [...mockBalances] };
  },

  async getPeriodSummaries(): Promise<{ data: PeriodSummary[] }> {
    await new Promise((r) => setTimeout(r, 300));
    return { data: [...mockPeriods] };
  },
};
