import api from "@/api";
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
  collection_rate: number;
}

export const reportsApi = {
  async getFinancialSummary(): Promise<{ data: FinancialSummary }> {
    return api.get("/reports/summary");
  },

  async getDebtors(): Promise<{ data: DebtorInfo[] }> {
    return api.get("/reports/debtors");
  },

  async getAllBalances(): Promise<{ data: PlotBalance[] }> {
    return api.get("/reports/balances");
  },

  async getPeriodSummaries(): Promise<{ data: PeriodSummary[] }> {
    return api.get("/reports/periods");
  },
};
