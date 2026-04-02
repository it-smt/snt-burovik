// src/api/activity.ts

import type { ActivityLog } from "@/types";

const mockLogs: ActivityLog[] = [
  {
    id: 1,
    user_id: 2,
    user_name: "Петров П.П.",
    action: "create",
    entity_type: "charge",
    entity_id: 5,
    entity_name: "Начисление",
    details: "Массовое начисление за февраль 2025",
    created_at: "2025-01-31T10:30:00",
  },
  {
    id: 2,
    user_id: 3,
    user_name: "Сидорова А.С.",
    action: "create",
    entity_type: "payment",
    entity_id: 3,
    entity_name: "Оплата",
    details: "Участок А-02, 5000 ₽",
    created_at: "2025-01-31T09:15:00",
  },
  {
    id: 3,
    user_id: 1,
    user_name: "Иванов И.И.",
    action: "create",
    entity_type: "meter",
    entity_id: 4,
    entity_name: "Показания",
    details: "Электричество: 15450 кВт·ч",
    created_at: "2025-01-30T18:45:00",
  },
  {
    id: 4,
    user_id: 2,
    user_name: "Петров П.П.",
    action: "update",
    entity_type: "plot",
    entity_id: 1,
    entity_name: "Участок А-01",
    details: "Изменён владелец",
    created_at: "2025-01-30T14:20:00",
  },
  {
    id: 5,
    user_id: 2,
    user_name: "Петров П.П.",
    action: "create",
    entity_type: "announcement",
    entity_id: 4,
    entity_name: "Объявление",
    details: "Собрание членов СНТ",
    created_at: "2025-01-30T11:00:00",
  },
  {
    id: 6,
    user_id: 2,
    user_name: "Петров П.П.",
    action: "respond",
    entity_type: "appeal",
    entity_id: 2,
    entity_name: "Обращение",
    details: "Статус: Решено",
    created_at: "2025-01-29T16:30:00",
  },
  {
    id: 7,
    user_id: 3,
    user_name: "Сидорова А.С.",
    action: "verify",
    entity_type: "meter",
    entity_id: 2,
    entity_name: "Показания",
    details: "Подтверждено показание",
    created_at: "2025-01-29T10:00:00",
  },
  {
    id: 8,
    user_id: 2,
    user_name: "Петров П.П.",
    action: "create",
    entity_type: "user",
    entity_id: 7,
    entity_name: "Пользователь",
    details: "Новый владелец: Морозов А.В.",
    created_at: "2025-01-28T15:45:00",
  },
];

export const activityApi = {
  async getRecent(limit = 20): Promise<{ data: ActivityLog[] }> {
    await new Promise((r) => setTimeout(r, 300));
    return { data: mockLogs.slice(0, limit) };
  },
};
