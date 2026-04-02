// src/api/meters.ts

import type { MeterReading } from "@/types";

const mockReadings: MeterReading[] = [
  {
    id: 1,
    plot_id: 1,
    meter_type: "electricity",
    value: 15234,
    reading_date: "2025-01-25",
    submitted_by: 1,
    is_verified: true,
  },
  {
    id: 2,
    plot_id: 1,
    meter_type: "water_cold",
    value: 456,
    reading_date: "2025-01-25",
    submitted_by: 1,
    is_verified: false,
  },
  {
    id: 3,
    plot_id: 2,
    meter_type: "electricity",
    value: 8920,
    reading_date: "2025-01-20",
    submitted_by: 4,
    is_verified: true,
  },
];

let nextId = 4;

export const metersApi = {
  async getReadings(params?: {
    plot_id?: number;
  }): Promise<{ data: MeterReading[] }> {
    await new Promise((r) => setTimeout(r, 200));
    let data = [...mockReadings];
    if (params?.plot_id)
      data = data.filter((r) => r.plot_id === params.plot_id);
    return {
      data: data.sort((a, b) => b.reading_date.localeCompare(a.reading_date)),
    };
  },

  async submitReading(
    data: Omit<MeterReading, "id" | "is_verified">,
  ): Promise<{ data: MeterReading }> {
    await new Promise((r) => setTimeout(r, 300));
    const reading = { ...data, id: nextId++, is_verified: false };
    mockReadings.push(reading);
    return { data: reading };
  },

  async verifyReading(id: number): Promise<{ data: MeterReading }> {
    await new Promise((r) => setTimeout(r, 200));
    const reading = mockReadings.find((r) => r.id === id);
    if (!reading) throw { response: { status: 404 } };
    reading.is_verified = true;
    return { data: reading };
  },
};
