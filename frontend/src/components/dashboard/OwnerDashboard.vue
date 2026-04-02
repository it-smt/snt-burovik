<!-- src/components/dashboard/OwnerDashboard.vue -->

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { plotsApi } from "@/api/plots";
import { announcementsApi } from "@/api/announcements";
import type { Plot, PlotBalance, Announcement } from "@/types";

const plots = ref<Plot[]>([]);
const balances = ref<Map<number, PlotBalance>>(new Map());
const announcements = ref<Announcement[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const [plotsRes, annRes] = await Promise.all([
      plotsApi.getMyPlots(),
      announcementsApi.getAll({ page: 1 }),
    ]);

    plots.value = plotsRes.data;
    announcements.value = annRes.data.items.slice(0, 5);

    // Загружаем баланс по каждому участку
    for (const plot of plots.value) {
      const balRes = await plotsApi.getBalance(plot.id);
      balances.value.set(plot.id, balRes.data);
    }
  } finally {
    loading.value = false;
  }
});

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-RU");
}
</script>

<template>
  <div v-if="loading" class="loading">
    <i class="pi pi-spinner pi-spin" style="font-size: 2rem"></i>
    <p>Загрузка...</p>
  </div>

  <div v-else class="owner-dashboard">
    <!-- Карточки участков -->
    <div class="section">
      <h3><i class="pi pi-map"></i> Мои участки</h3>
      <div class="cards-grid">
        <div v-for="plot in plots" :key="plot.id" class="plot-card">
          <div class="plot-header">
            <span class="plot-number">Участок {{ plot.number }}</span>
            <span class="plot-area">{{ plot.area_sqm }} м²</span>
          </div>
          <div class="plot-details">
            <div class="detail">
              <i
                class="pi pi-bolt"
                :class="{ active: plot.has_electricity }"
              ></i>
              Электричество
            </div>
            <div class="detail">
              <i class="pi pi-database" :class="{ active: plot.has_water }"></i>
              Водоснабжение
            </div>
          </div>
          <div
            class="plot-balance"
            :class="{
              debt: (balances.get(plot.id)?.balance ?? 0) < 0,
              paid: (balances.get(plot.id)?.balance ?? 0) >= 0,
            }"
          >
            <span class="balance-label">
              {{
                (balances.get(plot.id)?.balance ?? 0) < 0
                  ? "Задолженность"
                  : "Баланс"
              }}
            </span>
            <span class="balance-value">
              {{ formatMoney(Math.abs(balances.get(plot.id)?.balance ?? 0)) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Быстрые действия -->
    <div class="section">
      <h3><i class="pi pi-bolt"></i> Быстрые действия</h3>
      <div class="actions-grid">
        <RouterLink to="/meters" class="action-card">
          <i class="pi pi-gauge"></i>
          <span>Передать показания</span>
        </RouterLink>
        <RouterLink to="/payments" class="action-card">
          <i class="pi pi-wallet"></i>
          <span>История платежей</span>
        </RouterLink>
        <RouterLink to="/appeals" class="action-card">
          <i class="pi pi-envelope"></i>
          <span>Написать обращение</span>
        </RouterLink>
      </div>
    </div>

    <!-- Объявления -->
    <div class="section">
      <h3><i class="pi pi-megaphone"></i> Последние объявления</h3>
      <div class="announcements-list">
        <div
          v-for="ann in announcements"
          :key="ann.id"
          class="announcement-item"
          :class="{ important: ann.is_important }"
        >
          <div class="ann-header">
            <span class="ann-title">{{ ann.title }}</span>
            <span class="ann-date">{{ formatDate(ann.published_at) }}</span>
          </div>
          <p class="ann-content">{{ ann.content }}</p>
          <span v-if="ann.is_important" class="important-badge">
            <i class="pi pi-exclamation-triangle"></i> Важно
          </span>
        </div>

        <p v-if="announcements.length === 0" class="empty">Нет объявлений</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px;
  color: #64748b;
}

.owner-dashboard {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section {
  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #334155;
    margin-bottom: 16px;
    font-size: 1.15rem;
  }
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.plot-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.plot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.plot-number {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
}

.plot-area {
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #475569;
}

.plot-details {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;

  .detail {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9rem;
    color: #64748b;

    i {
      color: #cbd5e1;

      &.active {
        color: #22c55e;
      }
    }
  }
}

.plot-balance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;

  &.debt {
    background: #fef2f2;
    .balance-label {
      color: #dc2626;
    }
    .balance-value {
      color: #dc2626;
      font-weight: 700;
    }
  }

  &.paid {
    background: #f0fdf4;
    .balance-label {
      color: #16a34a;
    }
    .balance-value {
      color: #16a34a;
      font-weight: 700;
    }
  }
}

.balance-value {
  font-size: 1.1rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  text-decoration: none;
  color: #334155;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    border-color: #6366f1;
    color: #6366f1;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  }

  i {
    font-size: 1.3rem;
  }
}

.announcements-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.announcement-item {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px 20px;

  &.important {
    border-left: 4px solid #f59e0b;
  }
}

.ann-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.ann-title {
  font-weight: 600;
  color: #1e293b;
}

.ann-date {
  font-size: 0.85rem;
  color: #94a3b8;
}

.ann-content {
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

.important-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 0.8rem;
  color: #d97706;
  font-weight: 600;
}

.empty {
  color: #94a3b8;
  text-align: center;
  padding: 24px;
}
</style>
