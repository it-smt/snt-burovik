<script setup lang="ts">
import { ref, onMounted } from "vue";
import ActivityFeed from "./ActivityFeed.vue";
import { reportsApi } from "@/api/reports";
import { appealsApi } from "@/api/appeals";

const stats = ref({
  totalPlots: 0,
  activeOwners: 0,
  totalDebt: 0,
  pendingAppeals: 0,
});

const loading = ref(true);

onMounted(async () => {
  try {
    const [summaryRes, appealsRes] = await Promise.all([
      reportsApi.getFinancialSummary(),
      appealsApi.getAll({ status: "new", page: 1, per_page: 100 }),
    ]);

    stats.value = {
      totalPlots: summaryRes.data.total_plots,
      activeOwners: summaryRes.data.total_owners,
      totalDebt: summaryRes.data.total_debt,
      pendingAppeals: appealsRes.data.total,
    };
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
</script>

<template>
  <div class="chairman-dashboard">
    <div v-if="loading" class="loading">
      <i class="pi pi-spinner pi-spin"></i>
      <span>Загрузка...</span>
    </div>

    <template v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #dbeafe">
            <i class="pi pi-map" style="color: #2563eb"></i>
          </div>
          <div>
            <div class="stat-value">{{ stats.totalPlots }}</div>
            <div class="stat-label">Всего участков</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #dcfce7">
            <i class="pi pi-users" style="color: #16a34a"></i>
          </div>
          <div>
            <div class="stat-value">{{ stats.activeOwners }}</div>
            <div class="stat-label">Активных владельцев</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #fef2f2">
            <i class="pi pi-exclamation-triangle" style="color: #dc2626"></i>
          </div>
          <div>
            <div class="stat-value">{{ formatMoney(stats.totalDebt) }}</div>
            <div class="stat-label">Общая задолженность</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #fef3c7">
            <i class="pi pi-envelope" style="color: #d97706"></i>
          </div>
          <div>
            <div class="stat-value">{{ stats.pendingAppeals }}</div>
            <div class="stat-label">Необработанных обращений</div>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="quick-links-section">
          <h3><i class="pi pi-bolt"></i> Быстрые действия</h3>
          <div class="quick-links">
            <RouterLink to="/plots" class="action-card">
              <i class="pi pi-map"></i>
              <span>Управление участками</span>
            </RouterLink>
            <RouterLink to="/users" class="action-card">
              <i class="pi pi-users"></i>
              <span>Пользователи</span>
            </RouterLink>
            <RouterLink to="/announcements" class="action-card">
              <i class="pi pi-megaphone"></i>
              <span>Создать объявление</span>
            </RouterLink>
            <RouterLink to="/appeals" class="action-card">
              <i class="pi pi-envelope"></i>
              <span>Обращения</span>
            </RouterLink>
            <RouterLink to="/reports" class="action-card">
              <i class="pi pi-chart-bar"></i>
              <span>Отчёты</span>
            </RouterLink>
            <RouterLink to="/settings" class="action-card">
              <i class="pi pi-cog"></i>
              <span>Настройки</span>
            </RouterLink>
          </div>
        </div>

        <ActivityFeed />
      </div>
    </template>
  </div>
</template>

<style lang="scss">
.chairman-dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.quick-links-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;

  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 16px;
    font-size: 1rem;
    color: var(--text-primary);
  }
}

.quick-links {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
</style>
