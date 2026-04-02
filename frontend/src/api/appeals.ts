// src/api/appeals.ts

import type { Appeal, PaginatedResponse } from "@/types";

const mockAppeals: Appeal[] = [
  {
    id: 1,
    plot_id: 1,
    subject: "Сломанный забор на общей территории",
    message:
      "Возле участка А-01 повреждён забор общей территории. Просьба организовать ремонт.",
    status: "new",
    created_at: "2025-01-28",
  },
  {
    id: 2,
    plot_id: 2,
    subject: "Перерасчёт за воду",
    message:
      "Прошу сделать перерасчёт за воду за декабрь — счётчик показал меньше, чем начислено.",
    status: "in_progress",
    response: "Рассматриваем ваше обращение, запросили данные у бухгалтера.",
    created_at: "2025-01-20",
  },
  {
    id: 3,
    plot_id: 1,
    subject: "Шум от стройки на соседнем участке",
    message: "Сосед ведёт строительные работы после 22:00. Прошу разобраться.",
    status: "resolved",
    response: "Провели беседу с владельцем участка А-02. Нарушения прекращены.",
    created_at: "2025-01-10",
    resolved_at: "2025-01-15",
  },
  {
    id: 4,
    plot_id: 5,
    subject: "Не горит фонарь",
    message: "На линии Б возле участка Б-02 не работает уличное освещение.",
    status: "rejected",
    response:
      "Фонарь находится на балансе электросетевой компании. Направьте заявку им напрямую.",
    created_at: "2025-01-05",
    resolved_at: "2025-01-08",
  },
  {
    id: 5,
    plot_id: 3,
    subject: "Подключение газа",
    message:
      "Планируется ли подключение газа к участкам линии А? Если да — хотели бы подать заявку.",
    status: "new",
    created_at: "2025-01-30",
  },
];

let nextId = 6;

export const appealsApi = {
  async getAll(params?: {
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ data: PaginatedResponse<Appeal> }> {
    await new Promise((r) => setTimeout(r, 300));

    let filtered = [...mockAppeals];

    if (params?.status) {
      filtered = filtered.filter((a) => a.status === params.status);
    }

    filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    const page = params?.page || 1;
    const perPage = params?.per_page || 20;
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

  async getById(id: number): Promise<{ data: Appeal }> {
    await new Promise((r) => setTimeout(r, 200));
    const appeal = mockAppeals.find((a) => a.id === id);
    if (!appeal) throw { response: { status: 404 } };
    return { data: appeal };
  },

  async create(
    data: Pick<Appeal, "plot_id" | "subject" | "message">,
  ): Promise<{ data: Appeal }> {
    await new Promise((r) => setTimeout(r, 400));
    const appeal: Appeal = {
      id: nextId++,
      plot_id: data.plot_id,
      subject: data.subject,
      message: data.message,
      status: "new",
      created_at: new Date().toISOString().split("T")[0],
    };
    mockAppeals.push(appeal);
    return { data: appeal };
  },

  async respond(
    id: number,
    data: { response: string; status: Appeal["status"] },
  ): Promise<{ data: Appeal }> {
    await new Promise((r) => setTimeout(r, 300));
    const appeal = mockAppeals.find((a) => a.id === id);
    if (!appeal) throw { response: { status: 404 } };

    appeal.response = data.response;
    appeal.status = data.status;
    if (data.status === "resolved" || data.status === "rejected") {
      appeal.resolved_at = new Date().toISOString().split("T")[0];
    }
    return { data: appeal };
  },

  async delete(id: number): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
    const idx = mockAppeals.findIndex((a) => a.id === id);
    if (idx !== -1) mockAppeals.splice(idx, 1);
  },
};
