<!-- src/components/dashboard/AccountantDashboard.vue -->

<script setup lang="ts">
import { ref, onMounted } from "vue";

const stats = ref({
  monthIncome: 0,
  monthCharges: 0,
  debtorsCount: 0,
  unverifiedMeters: 0,
});

onMounted(() => {
  stats.value = {
    monthIncome: 234500,
    monthCharges: 312000,
    debtorsCount: 23,
    unverifiedMeters: 12,
  };
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
  <div class="accountant-dashboard">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: #dcfce7">
          <i class="pi pi-arrow-down" style="color: #16a34a"></i>
        </div>
        <div>
          <div class="stat-value">{{ formatMoney(stats.monthIncome) }}</div>
          <div class="stat-label">Поступления за месяц</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #dbeafe">
          <i class="pi pi-file" style="color: #2563eb"></i>
        </div>
        <div>
          <div class="stat-value">{{ formatMoney(stats.monthCharges) }}</div>
          <div class="stat-label">Начислено за месяц</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #fef2f2">
          <i class="pi pi-users" style="color: #dc2626"></i>
        </div>
        <div>
          <div class="stat-value">{{ stats.debtorsCount }}</div>
          <div class="stat-label">Должников</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #fef3c7">
          <i class="pi pi-gauge" style="color: #d97706"></i>
        </div>
        <div>
          <div class="stat-value">{{ stats.unverifiedMeters }}</div>
          <div class="stat-label">Непроверенных показаний</div>
        </div>
      </div>
    </div>

    <div class="quick-links-section">
      <h3><i class="pi pi-bolt"></i> Быстрые действия</h3>
      <div class="quick-links">
        <RouterLink to="/payments" class="action-card">
          <i class="pi pi-wallet"></i>
          <span>Начисления и оплаты</span>
        </RouterLink>
        <RouterLink to="/meters" class="action-card">
          <i class="pi pi-gauge"></i>
          <span>Показания счётчиков</span>
        </RouterLink>
        <RouterLink to="/reports" class="action-card">
          <i class="pi pi-chart-bar"></i>
          <span>Отчёты</span>
        </RouterLink>
        <RouterLink to="/tariffs" class="action-card">
          <i class="pi pi-tag"></i>
          <span>Тарифы</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.accountant-dashboard {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.quick-links-section {
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
</style>
