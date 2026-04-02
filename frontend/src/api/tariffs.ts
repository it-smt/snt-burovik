// src/api/tariffs.ts

import type { Tariff } from "@/types";

const mockTariffs: Tariff[] = [
  {
    id: 1,
    name: "Членский взнос",
    type: "membership",
    rate: 150,
    unit: "сотка",
    effective_from: "2025-01-01",
  },
  {
    id: 2,
    name: "Целевой взнос (дорога)",
    type: "targeted",
    rate: 5000,
    unit: "участок",
    effective_from: "2025-01-01",
  },
  {
    id: 3,
    name: "Электричество",
    type: "electricity",
    rate: 6.5,
    unit: "кВт·ч",
    effective_from: "2025-01-01",
  },
  {
    id: 4,
    name: "Вода",
    type: "water",
    rate: 45,
    unit: "м³",
    effective_from: "2025-01-01",
  },
  {
    id: 5,
    name: "Вывоз мусора",
    type: "garbage",
    rate: 300,
    unit: "участок",
    effective_from: "2025-01-01",
  },
];

let nextId = 6;

export const tariffsApi = {
  async getAll(): Promise<{ data: Tariff[] }> {
    await new Promise((r) => setTimeout(r, 200));
    return { data: [...mockTariffs] };
  },

  async create(data: Omit<Tariff, "id">): Promise<{ data: Tariff }> {
    await new Promise((r) => setTimeout(r, 300));
    const tariff = { ...data, id: nextId++ };
    mockTariffs.push(tariff);
    return { data: tariff };
  },

  async update(id: number, data: Partial<Tariff>): Promise<{ data: Tariff }> {
    await new Promise((r) => setTimeout(r, 300));
    const tariff = mockTariffs.find((t) => t.id === id);
    if (!tariff) throw { response: { status: 404 } };
    Object.assign(tariff, data);
    return { data: tariff };
  },

  async delete(id: number): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
    const idx = mockTariffs.findIndex((t) => t.id === id);
    if (idx !== -1) mockTariffs.splice(idx, 1);
  },
};
