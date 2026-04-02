// src/api/payments.ts

import type { Charge, Payment } from "@/types";

const mockCharges: Charge[] = [
  {
    id: 1,
    plot_id: 1,
    tariff_id: 1,
    period: "2025-01",
    amount: 9000,
    description: "Членский взнос",
    created_at: "2025-01-01",
  },
  {
    id: 2,
    plot_id: 1,
    tariff_id: 5,
    period: "2025-01",
    amount: 300,
    description: "Вывоз мусора",
    created_at: "2025-01-01",
  },
  {
    id: 3,
    plot_id: 2,
    tariff_id: 1,
    period: "2025-01",
    amount: 12000,
    description: "Членский взнос",
    created_at: "2025-01-01",
  },
  {
    id: 4,
    plot_id: 5,
    tariff_id: 2,
    period: "2025-01",
    amount: 5000,
    description: "Целевой (дорога)",
    created_at: "2025-01-01",
  },
];

const mockPayments: Payment[] = [
  {
    id: 1,
    plot_id: 1,
    amount: 9300,
    payment_date: "2025-01-15",
    payment_method: "card",
    description: "Оплата за январь",
    recorded_by: 3,
    created_at: "2025-01-15",
  },
  {
    id: 2,
    plot_id: 2,
    amount: 5000,
    payment_date: "2025-01-20",
    payment_method: "cash",
    description: "Частичная оплата",
    recorded_by: 3,
    created_at: "2025-01-20",
  },
];

let chargeId = 5,
  paymentId = 3;

export interface MassChargeData {
  tariff_id: number;
  period: string;
  description: string;
  plot_ids: number[]; // пустой = все участки с владельцем
  amount_per_plot?: number; // если 0 — рассчитать по тарифу
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
    await new Promise((r) => setTimeout(r, 200));
    let data = [...mockCharges];
    if (params?.plot_id)
      data = data.filter((c) => c.plot_id === params.plot_id);
    if (params?.period) data = data.filter((c) => c.period === params.period);
    return {
      data: data.sort((a, b) => b.created_at.localeCompare(a.created_at)),
    };
  },

  async createCharge(
    data: Omit<Charge, "id" | "created_at">,
  ): Promise<{ data: Charge }> {
    await new Promise((r) => setTimeout(r, 300));
    const charge = {
      ...data,
      id: chargeId++,
      created_at: new Date().toISOString(),
    };
    mockCharges.push(charge);
    return { data: charge };
  },

  async createMassCharge(
    data: MassChargeData,
  ): Promise<{ data: MassChargeResult }> {
    await new Promise((r) => setTimeout(r, 800));

    const plotIds = data.plot_ids.length > 0 ? data.plot_ids : [1, 2, 3, 5, 6];
    let totalAmount = 0;
    let created = 0;
    let skipped = 0;

    for (const plotId of plotIds) {
      // Проверяем — нет ли уже начисления за этот период
      const exists = mockCharges.some(
        (c) =>
          c.plot_id === plotId &&
          c.period === data.period &&
          c.tariff_id === data.tariff_id,
      );

      if (exists) {
        skipped++;
        continue;
      }

      const amount = data.amount_per_plot || 5000;
      mockCharges.push({
        id: chargeId++,
        plot_id: plotId,
        tariff_id: data.tariff_id,
        period: data.period,
        amount,
        description: data.description,
        created_at: new Date().toISOString(),
      });
      totalAmount += amount;
      created++;
    }

    return {
      data: {
        created_count: created,
        total_amount: totalAmount,
        skipped_count: skipped,
      },
    };
  },

  async getPayments(params?: {
    plot_id?: number;
  }): Promise<{ data: Payment[] }> {
    await new Promise((r) => setTimeout(r, 200));
    let data = [...mockPayments];
    if (params?.plot_id)
      data = data.filter((p) => p.plot_id === params.plot_id);
    return {
      data: data.sort((a, b) => b.created_at.localeCompare(a.created_at)),
    };
  },

  async createPayment(
    data: Omit<Payment, "id" | "created_at">,
  ): Promise<{ data: Payment }> {
    await new Promise((r) => setTimeout(r, 300));
    const payment = {
      ...data,
      id: paymentId++,
      created_at: new Date().toISOString(),
    };
    mockPayments.push(payment);
    return { data: payment };
  },
};
