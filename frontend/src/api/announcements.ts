// src/api/announcements.ts

import type { Announcement } from "@/types";

const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "Собрание членов СОНТ",
    content:
      "Уважаемые садоводы! 15 февраля в 12:00 состоится общее собрание. Явка обязательна.",
    is_important: true,
    author_id: 2,
    published_at: "2025-01-20",
  },
  {
    id: 2,
    title: "Отключение воды",
    content:
      "С 1 по 3 февраля будет проводиться ремонт водопровода. Запаситесь водой.",
    is_important: true,
    author_id: 2,
    published_at: "2025-01-25",
  },
  {
    id: 3,
    title: "Вывоз мусора",
    content:
      "Напоминаем, что вывоз мусора осуществляется по вторникам и пятницам.",
    is_important: false,
    author_id: 2,
    published_at: "2025-01-10",
  },
];

let nextId = 4;

export const announcementsApi = {
  async getAll(): Promise<{ data: { items: Announcement[] } }> {
    await new Promise((r) => setTimeout(r, 200));
    return {
      data: {
        items: [...mockAnnouncements].sort((a, b) =>
          b.published_at.localeCompare(a.published_at),
        ),
      },
    };
  },

  async create(
    data: Omit<Announcement, "id" | "published_at">,
  ): Promise<{ data: Announcement }> {
    await new Promise((r) => setTimeout(r, 300));
    const ann = {
      ...data,
      id: nextId++,
      published_at: new Date().toISOString().split("T")[0],
    };
    mockAnnouncements.push(ann);
    return { data: ann };
  },

  async delete(id: number): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
    const idx = mockAnnouncements.findIndex((a) => a.id === id);
    if (idx !== -1) mockAnnouncements.splice(idx, 1);
  },
};
