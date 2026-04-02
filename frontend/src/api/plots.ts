// src/api/plots.ts

import type { PaginatedResponse, Plot, PlotBalance } from "@/types";

// Связываем с пользователями (id из users.ts)
const mockPlots: Plot[] = [
  {
    id: 1,
    number: "А-01",
    area_sqm: 600,
    cadastral_number: "50:26:0180505:123",
    address: "Линия А, участок 1",
    owner_id: 1,
    has_electricity: true,
    has_water: true,
    created_at: "2020-01-15",
  },
  {
    id: 2,
    number: "А-02",
    area_sqm: 800,
    cadastral_number: "50:26:0180505:124",
    address: "Линия А, участок 2",
    owner_id: 4,
    has_electricity: true,
    has_water: true,
    created_at: "2020-01-15",
  },
  {
    id: 3,
    number: "А-03",
    area_sqm: 600,
    cadastral_number: "50:26:0180505:125",
    address: "Линия А, участок 3",
    owner_id: 5,
    has_electricity: true,
    has_water: false,
    created_at: "2020-01-15",
  },
  {
    id: 4,
    number: "Б-01",
    area_sqm: 1000,
    cadastral_number: "50:26:0180505:126",
    address: "Линия Б, участок 1",
    owner_id: null,
    has_electricity: false,
    has_water: false,
    created_at: "2020-01-15",
  },
  {
    id: 5,
    number: "Б-02",
    area_sqm: 750,
    cadastral_number: "50:26:0180505:127",
    address: "Линия Б, участок 2",
    owner_id: 1,
    has_electricity: true,
    has_water: true,
    created_at: "2021-03-20",
  },
  {
    id: 6,
    number: "В-01",
    area_sqm: 500,
    address: "Линия В, участок 1",
    owner_id: 6,
    has_electricity: true,
    has_water: false,
    created_at: "2022-05-10",
  },
];

// Моковые владельцы для отображения
const mockOwners: Record<
  number,
  { id: number; full_name: string; phone: string }
> = {
  1: { id: 1, full_name: "Иванов Иван Иванович", phone: "+7 900 123-45-67" },
  4: {
    id: 4,
    full_name: "Козлов Сергей Викторович",
    phone: "+7 900 444-55-66",
  },
  5: { id: 5, full_name: "Новикова Елена Павловна", phone: "+7 900 777-88-99" },
  6: {
    id: 6,
    full_name: "Фёдоров Алексей Николаевич",
    phone: "+7 900 222-33-44",
  },
};

// Моковые балансы
const mockBalances: Record<number, PlotBalance> = {
  1: {
    plot_id: 1,
    plot_number: "А-01",
    owner_name: "Иванов И.И.",
    total_charged: 15000,
    total_paid: 15000,
    balance: 0,
  },
  2: {
    plot_id: 2,
    plot_number: "А-02",
    owner_name: "Козлов С.В.",
    total_charged: 18000,
    total_paid: 10000,
    balance: -8000,
  },
  3: {
    plot_id: 3,
    plot_number: "А-03",
    owner_name: "Новикова Е.П.",
    total_charged: 12000,
    total_paid: 12000,
    balance: 0,
  },
  4: {
    plot_id: 4,
    plot_number: "Б-01",
    owner_name: "—",
    total_charged: 0,
    total_paid: 0,
    balance: 0,
  },
  5: {
    plot_id: 5,
    plot_number: "Б-02",
    owner_name: "Иванов И.И.",
    total_charged: 20000,
    total_paid: 5000,
    balance: -15000,
  },
  6: {
    plot_id: 6,
    plot_number: "В-01",
    owner_name: "Фёдоров А.Н.",
    total_charged: 10000,
    total_paid: 10000,
    balance: 0,
  },
};

let nextId = 7;

export interface CreatePlotData {
  number: string;
  area_sqm: number;
  cadastral_number?: string;
  address: string;
  owner_id?: number | null;
  has_electricity: boolean;
  has_water: boolean;
}

export interface UpdatePlotData extends Partial<CreatePlotData> {}

function enrichPlot(
  plot: Plot,
): Plot & { owner?: { id: number; full_name: string; phone: string } } {
  return {
    ...plot,
    owner: plot.owner_id ? mockOwners[plot.owner_id] : undefined,
  };
}

export const plotsApi = {
  async getAll(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    has_owner?: boolean;
  }): Promise<{ data: PaginatedResponse<Plot> }> {
    await new Promise((r) => setTimeout(r, 300));

    let filtered = [...mockPlots];

    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.number.toLowerCase().includes(s) ||
          p.address.toLowerCase().includes(s) ||
          (p.owner_id &&
            mockOwners[p.owner_id]?.full_name.toLowerCase().includes(s)),
      );
    }

    if (params?.has_owner === true) {
      filtered = filtered.filter((p) => p.owner_id);
    } else if (params?.has_owner === false) {
      filtered = filtered.filter((p) => !p.owner_id);
    }

    const page = params?.page || 1;
    const perPage = params?.per_page || 20;
    const start = (page - 1) * perPage;
    const items = filtered.slice(start, start + perPage).map(enrichPlot);

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

  async getById(id: number): Promise<{ data: Plot }> {
    await new Promise((r) => setTimeout(r, 200));
    const plot = mockPlots.find((p) => p.id === id);
    if (!plot) throw { response: { status: 404 } };
    return { data: enrichPlot(plot) };
  },

  async create(data: CreatePlotData): Promise<{ data: Plot }> {
    await new Promise((r) => setTimeout(r, 400));

    if (mockPlots.some((p) => p.number === data.number)) {
      throw {
        response: {
          status: 400,
          data: { detail: "Участок с таким номером уже существует" },
        },
      };
    }

    const newPlot: Plot = {
      id: nextId++,
      number: data.number,
      area_sqm: data.area_sqm,
      cadastral_number: data.cadastral_number,
      address: data.address,
      owner_id: data.owner_id ?? null,
      has_electricity: data.has_electricity,
      has_water: data.has_water,
      created_at: new Date().toISOString().split("T")[0],
    };

    mockPlots.push(newPlot);

    // Создаём баланс
    mockBalances[newPlot.id] = {
      plot_id: newPlot.id,
      plot_number: newPlot.number,
      owner_name: newPlot.owner_id
        ? mockOwners[newPlot.owner_id]?.full_name || "—"
        : "—",
      total_charged: 0,
      total_paid: 0,
      balance: 0,
    };

    return { data: enrichPlot(newPlot) };
  },

  async update(id: number, data: UpdatePlotData): Promise<{ data: Plot }> {
    await new Promise((r) => setTimeout(r, 300));

    const plot = mockPlots.find((p) => p.id === id);
    if (!plot) throw { response: { status: 404 } };

    Object.assign(plot, data);
    return { data: enrichPlot(plot) };
  },

  async delete(id: number): Promise<void> {
    await new Promise((r) => setTimeout(r, 300));

    const index = mockPlots.findIndex((p) => p.id === id);
    if (index === -1) throw { response: { status: 404 } };

    mockPlots.splice(index, 1);
    delete mockBalances[id];
  },

  async getMyPlots(): Promise<{ data: Plot[] }> {
    await new Promise((r) => setTimeout(r, 300));

    // Для мока возвращаем участки владельца с id=1
    const myPlots = mockPlots.filter((p) => p.owner_id === 1).map(enrichPlot);
    return { data: myPlots };
  },

  async getBalance(plotId: number): Promise<{ data: PlotBalance }> {
    await new Promise((r) => setTimeout(r, 200));

    const balance = mockBalances[plotId];
    if (!balance) {
      return {
        data: {
          plot_id: plotId,
          plot_number: "—",
          owner_name: "—",
          total_charged: 0,
          total_paid: 0,
          balance: 0,
        },
      };
    }
    return { data: balance };
  },

  async getAllBalances(): Promise<{ data: PlotBalance[] }> {
    await new Promise((r) => setTimeout(r, 300));
    return { data: Object.values(mockBalances) };
  },

  async getOwnersList(): Promise<{
    data: { id: number; full_name: string }[];
  }> {
    await new Promise((r) => setTimeout(r, 200));
    return {
      data: Object.values(mockOwners).map((o) => ({
        id: o.id,
        full_name: o.full_name,
      })),
    };
  },
};
