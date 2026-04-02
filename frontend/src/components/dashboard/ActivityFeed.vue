<!-- src/components/dashboard/ActivityFeed.vue -->

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { activityApi } from "@/api/activity";
import type { ActivityLog } from "@/types";

const logs = ref<ActivityLog[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const { data } = await activityApi.getRecent(10);
    logs.value = data;
  } finally {
    loading.value = false;
  }
});

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} мин. назад`;
  if (hours < 24) return `${hours} ч. назад`;
  if (days < 7) return `${days} дн. назад`;
  return date.toLocaleDateString("ru-RU");
}

const actionLabels: Record<string, string> = {
  create: "создал",
  update: "изменил",
  delete: "удалил",
  verify: "подтвердил",
  respond: "ответил на",
};

const entityIcons: Record<string, string> = {
  user: "pi-user",
  plot: "pi-map",
  payment: "pi-wallet",
  charge: "pi-file",
  meter: "pi-gauge",
  announcement: "pi-megaphone",
  appeal: "pi-envelope",
};

const entityColors: Record<string, string> = {
  user: "#6366f1",
  plot: "#22c55e",
  payment: "#16a34a",
  charge: "#f59e0b",
  meter: "#06b6d4",
  announcement: "#8b5cf6",
  appeal: "#ec4899",
};
</script>

<template>
  <div class="activity-feed card">
    <div class="activity-header">
      <h3><i class="pi pi-history"></i> Последние действия</h3>
    </div>

    <div v-if="loading" class="activity-loading">
      <i class="pi pi-spinner pi-spin"></i>
    </div>

    <div v-else class="activity-list">
      <div v-for="log in logs" :key="log.id" class="activity-item">
        <div
          class="activity-icon"
          :style="{
            background: entityColors[log.entity_type] + '20',
            color: entityColors[log.entity_type],
          }"
        >
          <i :class="['pi', entityIcons[log.entity_type]]"></i>
        </div>
        <div class="activity-content">
          <div class="activity-text">
            <strong>{{ log.user_name }}</strong>
            {{ actionLabels[log.action] || log.action }}
            <span class="activity-entity">{{
              log.entity_name.toLowerCase()
            }}</span>
          </div>
          <div v-if="log.details" class="activity-details">
            {{ log.details }}
          </div>
          <div class="activity-time">{{ formatTime(log.created_at) }}</div>
        </div>
      </div>

      <div v-if="!logs.length" class="activity-empty">
        <i class="pi pi-inbox"></i>
        <span>Нет активности</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.activity-feed {
  .activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-primary);
    }
  }
}

.activity-loading {
  display: flex;
  justify-content: center;
  padding: 40px;
  color: var(--text-secondary);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  i {
    font-size: 0.9rem;
  }
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  font-size: 0.9rem;
  color: var(--text-primary);
  line-height: 1.4;

  strong {
    font-weight: 600;
  }

  .activity-entity {
    color: var(--text-secondary);
  }
}

.activity-details {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-time {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 4px;
}

.activity-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px;
  color: var(--text-secondary);

  i {
    font-size: 2rem;
    opacity: 0.3;
  }
}
</style>
