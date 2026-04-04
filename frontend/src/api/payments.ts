import api from "@/api";
import type { Charge, Payment } from "@/types";

export interface MassChargeData {
  tariff_id: number;
  period: string;
  description: string;
  plot_ids: number[];
  amount_per_plot?: number;
}

export interface MassChargeResult {
  created_count: number;
  total_amount: number;
  skipped_count: number;
}

export const paymentsApi = {
  async getCharges(params?: {
    plot_id?: number;
    period?: string;
  }): Promise<{ data: Charge[] }> {
    return api.get("/payments/charges", { params });
  },

  async createCharge(
    data: Omit<Charge, "id" | "created_at" | "plot" | "tariff">,
  ): Promise<{ data: Charge }> {
    return api.post("/payments/charges", data);
  },

  async createMassCharge(
    data: MassChargeData,
  ): Promise<{ data: MassChargeResult }> {
    return api.post("/payments/charges/mass", data);
  },

  async getPayments(params?: {
    plot_id?: number;
  }): Promise<{ data: Payment[] }> {
    return api.get("/payments/payments", { params });
  },

  async createPayment(
    data: Omit<Payment, "id" | "created_at" | "plot" | "recorded_by">,
  ): Promise<{ data: Payment }> {
    return api.post("/payments/payments", data);
  },
};
