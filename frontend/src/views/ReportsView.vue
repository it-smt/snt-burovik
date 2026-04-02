<!-- src/views/ReportsView.vue -->

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAppToast } from "@/composables/useToast";
import {
  reportsApi,
  type DebtorInfo,
  type PeriodSummary,
  type FinancialSummary,
} from "@/api/reports";
import type { PlotBalance } from "@/types";
import Skeleton from "@/components/common/Skeleton.vue";
import { exportToCSV, formatMoneyForExport } from "@/utils/export";

const toast = useAppToast();
const loading = ref(true);
const tab = ref<"summary" | "debtors" | "balances" | "periods">("summary");

const summary = ref<FinancialSummary | null>(null);
const debtors = ref<DebtorInfo[]>([]);
const balances = ref<PlotBalance[]>([]);
const periods = ref<PeriodSummary[]>([]);

async function load() {
  loading.value = true;
  try {
    const [s, d, b, p] = await Promise.all([
      reportsApi.getFinancialSummary(),
      reportsApi.getDebtors(),
      reportsApi.getAllBalances(),
      reportsApi.getPeriodSummaries(),
    ]);
    summary.value = s.data;
    debtors.value = d.data;
    balances.value = b.data;
    periods.value = p.data;
  } catch {
    toast.error("Не удалось загрузить отчёты");
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  const months = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];
  return `${months[parseInt(month) - 1]} ${year}`;
}

function getBalanceClass(balance: number): string {
  if (balance < 0) return "debt";
  if (balance > 0) return "overpaid";
  return "zero";
}

function getCollectionClass(rate: number): string {
  if (rate >= 90) return "good";
  if (rate >= 70) return "medium";
  return "bad";
}

// Экспорт
function exportDebtors() {
  const data = debtors.value.map((d) => ({
    Участок: d.plot_number,
    Владелец: d.owner_name,
    Телефон: d.owner_phone,
    Email: d.owner_email,
    Начислено: formatMoneyForExport(d.total_charged),
    Оплачено: formatMoneyForExport(d.total_paid),
    Долг: formatMoneyForExport(d.debt),
  }));
  exportToCSV(data, `должники_${new Date().toISOString().split("T")[0]}`);
  toast.success("Файл скачан");
}

function exportBalances() {
  const data = balances.value.map((b) => ({
    Участок: b.plot_number,
    Владелец: b.owner_name,
    Начислено: formatMoneyForExport(b.total_charged),
    Оплачено: formatMoneyForExport(b.total_paid),
    Баланс: formatMoneyForExport(b.balance),
  }));
  exportToCSV(data, `балансы_${new Date().toISOString().split("T")[0]}`);
  toast.success("Файл скачан");
}

function exportPeriods() {
  const data = periods.value.map((p) => ({
    Период: p.period,
    Начислено: formatMoneyForExport(p.total_charged),
    Оплачено: formatMoneyForExport(p.total_paid),
    Долг: formatMoneyForExport(p.total_debt),
    Участков: p.plots_count,
    Оплатили: p.paid_count,
    "Собираемость %": Math.round((p.total_paid / p.total_charged) * 100),
  }));
  exportToCSV(data, `периоды_${new Date().toISOString().split("T")[0]}`);
  toast.success("Файл скачан");
}
</script>

<template>
  <div class="reports-page">
    <div class="page-header">
      <h2 class="page-title">Отчёты</h2>
    </div>

    <!-- Табы -->
    <div class="tabs">
      <button
        :class="['tab', { active: tab === 'summary' }]"
        @click="tab = 'summary'"
      >
        <i class="pi pi-chart-bar"></i>
        <span>Сводка</span>
      </button>
      <button
        :class="['tab', { active: tab === 'debtors' }]"
        @click="tab = 'debtors'"
      >
        <i class="pi pi-exclamation-triangle"></i>
        <span>Должники</span>
      </button>
      <button
        :class="['tab', { active: tab === 'balances' }]"
        @click="tab = 'balances'"
      >
        <i class="pi pi-wallet"></i>
        <span>Балансы</span>
      </button>
      <button
        :class="['tab', { active: tab === 'periods' }]"
        @click="tab = 'periods'"
      >
        <i class="pi pi-calendar"></i>
        <span>По периодам</span>
      </button>
    </div>

    <!-- Скелетон загрузки -->
    <template v-if="loading">
      <Skeleton type="stat" :count="4" />
      <Skeleton type="card" :count="3" />
    </template>

    <template v-else>
      <!-- ========== СВОДКА ========== -->
      <div v-if="tab === 'summary' && summary" class="report-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: #dbeafe">
              <i class="pi pi-map" style="color: #2563eb"></i>
            </div>
            <div>
              <div class="stat-value">{{ summary.total_plots }}</div>
              <div class="stat-label">Участков</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #dcfce7">
              <i class="pi pi-users" style="color: #16a34a"></i>
            </div>
            <div>
              <div class="stat-value">{{ summary.total_owners }}</div>
              <div class="stat-label">Владельцев</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #fef3c7">
              <i class="pi pi-file" style="color: #d97706"></i>
            </div>
            <div>
              <div class="stat-value">
                {{ formatMoney(summary.total_charged) }}
              </div>
              <div class="stat-label">Начислено</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #dcfce7">
              <i class="pi pi-check-circle" style="color: #16a34a"></i>
            </div>
            <div>
              <div class="stat-value">
                {{ formatMoney(summary.total_paid) }}
              </div>
              <div class="stat-label">Оплачено</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #fef2f2">
              <i class="pi pi-exclamation-triangle" style="color: #dc2626"></i>
            </div>
            <div>
              <div class="stat-value" style="color: var(--danger)">
                {{ formatMoney(summary.total_debt) }}
              </div>
              <div class="stat-label">Задолженность</div>
            </div>
          </div>

          <div class="stat-card">
            <div
              class="stat-icon"
              :style="{
                background:
                  summary.collection_rate >= 90
                    ? '#dcfce7'
                    : summary.collection_rate >= 70
                      ? '#fef3c7'
                      : '#fef2f2',
              }"
            >
              <i
                class="pi pi-percentage"
                :style="{
                  color:
                    summary.collection_rate >= 90
                      ? '#16a34a'
                      : summary.collection_rate >= 70
                        ? '#d97706'
                        : '#dc2626',
                }"
              ></i>
            </div>
            <div>
              <div
                class="stat-value"
                :class="getCollectionClass(summary.collection_rate)"
              >
                {{ summary.collection_rate }}%
              </div>
              <div class="stat-label">Собираемость</div>
            </div>
          </div>
        </div>

        <!-- Прогресс-бар собираемости -->
        <div class="collection-bar card">
          <h3>Собираемость взносов</h3>
          <div class="progress-container">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: summary.collection_rate + '%' }"
                :class="getCollectionClass(summary.collection_rate)"
              ></div>
            </div>
            <div class="progress-labels">
              <span>Оплачено: {{ formatMoney(summary.total_paid) }}</span>
              <span>Из: {{ formatMoney(summary.total_charged) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== ДОЛЖНИКИ ========== -->
      <div v-if="tab === 'debtors'" class="report-section">
        <div class="section-header">
          <h3>
            <i
              class="pi pi-exclamation-triangle"
              style="color: var(--danger)"
            ></i>
            Список должников ({{ debtors.length }})
          </h3>
          <button
            v-if="debtors.length"
            class="btn btn-sm btn-secondary"
            @click="exportDebtors"
          >
            <i class="pi pi-download"></i> Excel
          </button>
        </div>

        <!-- Десктоп таблица -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Участок</th>
                <th>Владелец</th>
                <th>Контакты</th>
                <th>Начислено</th>
                <th>Оплачено</th>
                <th>Долг</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in debtors" :key="d.plot_id">
                <td>
                  <strong>{{ d.plot_number }}</strong>
                </td>
                <td>{{ d.owner_name }}</td>
                <td>
                  <div class="contacts-cell">
                    <span><i class="pi pi-phone"></i> {{ d.owner_phone }}</span>
                    <span
                      ><i class="pi pi-envelope"></i> {{ d.owner_email }}</span
                    >
                  </div>
                </td>
                <td>{{ formatMoney(d.total_charged) }}</td>
                <td>{{ formatMoney(d.total_paid) }}</td>
                <td>
                  <span class="debt-amount">{{ formatMoney(d.debt) }}</span>
                </td>
              </tr>
              <tr v-if="!debtors.length">
                <td colspan="6" class="empty-row">Должников нет 🎉</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Мобильные карточки -->
        <div class="mobile-cards">
          <div
            v-for="d in debtors"
            :key="d.plot_id"
            class="mobile-card debtor-card"
          >
            <div class="mobile-card-header">
              <span class="mobile-card-title">{{ d.plot_number }}</span>
              <span class="debt-badge">{{ formatMoney(d.debt) }}</span>
            </div>
            <div class="mobile-card-body">
              <div class="mobile-card-row">
                <span class="label">Владелец</span>
                <span class="value">{{ d.owner_name }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">Телефон</span>
                <span class="value">{{ d.owner_phone }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">Начислено</span>
                <span class="value">{{ formatMoney(d.total_charged) }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">Оплачено</span>
                <span class="value">{{ formatMoney(d.total_paid) }}</span>
              </div>
            </div>
          </div>
          <div v-if="!debtors.length" class="empty-state">
            <i class="pi pi-check-circle"></i>
            <p>Должников нет 🎉</p>
          </div>
        </div>

        <!-- Итог -->
        <div v-if="debtors.length" class="total-row card">
          <span>Общая задолженность:</span>
          <span class="debt-amount total">
            {{ formatMoney(debtors.reduce((sum, d) => sum + d.debt, 0)) }}
          </span>
        </div>
      </div>

      <!-- ========== БАЛАНСЫ ========== -->
      <div v-if="tab === 'balances'" class="report-section">
        <div class="section-header">
          <h3>
            <i class="pi pi-wallet" style="color: var(--primary)"></i>
            Баланс по всем участкам
          </h3>
          <button
            v-if="balances.length"
            class="btn btn-sm btn-secondary"
            @click="exportBalances"
          >
            <i class="pi pi-download"></i> Excel
          </button>
        </div>

        <!-- Десктоп таблица -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Участок</th>
                <th>Владелец</th>
                <th>Начислено</th>
                <th>Оплачено</th>
                <th>Баланс</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in balances" :key="b.plot_id">
                <td>
                  <strong>{{ b.plot_number }}</strong>
                </td>
                <td>{{ b.owner_name }}</td>
                <td>{{ formatMoney(b.total_charged) }}</td>
                <td>{{ formatMoney(b.total_paid) }}</td>
                <td>
                  <span
                    class="balance-cell"
                    :class="getBalanceClass(b.balance)"
                  >
                    {{ b.balance < 0 ? "-" : ""
                    }}{{ formatMoney(Math.abs(b.balance)) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Мобильные карточки -->
        <div class="mobile-cards">
          <div v-for="b in balances" :key="b.plot_id" class="mobile-card">
            <div class="mobile-card-header">
              <span class="mobile-card-title">{{ b.plot_number }}</span>
              <span class="balance-badge" :class="getBalanceClass(b.balance)">
                {{ b.balance < 0 ? "-" : ""
                }}{{ formatMoney(Math.abs(b.balance)) }}
              </span>
            </div>
            <div class="mobile-card-body">
              <div class="mobile-card-row">
                <span class="label">Владелец</span>
                <span class="value">{{ b.owner_name }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">Начислено</span>
                <span class="value">{{ formatMoney(b.total_charged) }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">Оплачено</span>
                <span class="value">{{ formatMoney(b.total_paid) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== ПО ПЕРИОДАМ ========== -->
      <div v-if="tab === 'periods'" class="report-section">
        <div class="section-header">
          <h3>
            <i class="pi pi-calendar" style="color: var(--primary)"></i>
            Итоги по месяцам
          </h3>
          <button
            v-if="periods.length"
            class="btn btn-sm btn-secondary"
            @click="exportPeriods"
          >
            <i class="pi pi-download"></i> Excel
          </button>
        </div>

        <!-- Десктоп таблица -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Период</th>
                <th>Начислено</th>
                <th>Оплачено</th>
                <th>Долг</th>
                <th>Оплатили</th>
                <th>Собираемость</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in periods" :key="p.period">
                <td>
                  <strong>{{ formatPeriod(p.period) }}</strong>
                </td>
                <td>{{ formatMoney(p.total_charged) }}</td>
                <td style="color: var(--success); font-weight: 600">
                  {{ formatMoney(p.total_paid) }}
                </td>
                <td>
                  <span
                    v-if="p.total_debt > 0"
                    style="color: var(--danger); font-weight: 600"
                  >
                    {{ formatMoney(p.total_debt) }}
                  </span>
                  <span v-else style="color: var(--success)">—</span>
                </td>
                <td>{{ p.paid_count }} / {{ p.plots_count }}</td>
                <td>
                  <div class="mini-progress">
                    <div
                      class="mini-progress-fill"
                      :style="{
                        width: (p.total_paid / p.total_charged) * 100 + '%',
                      }"
                      :class="
                        getCollectionClass(
                          (p.total_paid / p.total_charged) * 100,
                        )
                      "
                    ></div>
                  </div>
                  <span
                    class="collection-rate"
                    :class="
                      getCollectionClass((p.total_paid / p.total_charged) * 100)
                    "
                  >
                    {{ Math.round((p.total_paid / p.total_charged) * 100) }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Мобильные карточки -->
        <div class="mobile-cards">
          <div
            v-for="p in periods"
            :key="p.period"
            class="mobile-card period-card"
          >
            <div class="mobile-card-header">
              <span class="mobile-card-title">{{
                formatPeriod(p.period)
              }}</span>
              <span
                class="collection-badge"
                :class="
                  getCollectionClass((p.total_paid / p.total_charged) * 100)
                "
              >
                {{ Math.round((p.total_paid / p.total_charged) * 100) }}%
              </span>
            </div>
            <div class="mobile-card-body">
              <div class="mobile-card-row">
                <span class="label">Начислено</span>
                <span class="value">{{ formatMoney(p.total_charged) }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">Оплачено</span>
                <span
                  class="value"
                  style="color: var(--success); font-weight: 600"
                >
                  {{ formatMoney(p.total_paid) }}
                </span>
              </div>
              <div class="mobile-card-row">
                <span class="label">Долг</span>
                <span
                  class="value"
                  :style="{
                    color:
                      p.total_debt > 0 ? 'var(--danger)' : 'var(--success)',
                  }"
                >
                  {{ p.total_debt > 0 ? formatMoney(p.total_debt) : "—" }}
                </span>
              </div>
              <div class="mobile-card-row">
                <span class="label">Оплатили</span>
                <span class="value"
                  >{{ p.paid_count }} из {{ p.plots_count }}</span
                >
              </div>
            </div>
            <div class="period-progress">
              <div class="mini-progress">
                <div
                  class="mini-progress-fill"
                  :style="{
                    width: (p.total_paid / p.total_charged) * 100 + '%',
                  }"
                  :class="
                    getCollectionClass((p.total_paid / p.total_charged) * 100)
                  "
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
.reports-page {
  .tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 24px;
    background: #f1f5f9;
    padding: 4px;
    border-radius: 10px;
    overflow-x: auto;

    @media (max-width: 640px) {
      gap: 2px;
    }
  }

  .tab {
    flex: 1;
    padding: 10px 16px;
    border: none;
    background: transparent;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    white-space: nowrap;
    font-size: 0.9rem;

    &.active {
      background: #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      color: var(--primary);
    }

    @media (max-width: 640px) {
      padding: 10px 12px;
      font-size: 0.8rem;
      gap: 4px;

      span {
        display: none;
      }

      i {
        font-size: 1.1rem;
      }
    }

    @media (max-width: 400px) {
      span {
        display: inline;
        font-size: 0.75rem;
      }
    }
  }
}

.report-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    font-size: 1.15rem;
    color: var(--text-primary);
  }
}

// Прогресс-бар собираемости
.collection-bar {
  h3 {
    margin: 0 0 16px;
    font-size: 1rem;
    color: var(--text-primary);
  }
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-bar {
  height: 24px;
  background: #f1f5f9;
  border-radius: 12px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 12px;
  transition: width 0.8s ease;

  &.good {
    background: linear-gradient(90deg, #22c55e, #16a34a);
  }

  &.medium {
    background: linear-gradient(90deg, #f59e0b, #d97706);
  }

  &.bad {
    background: linear-gradient(90deg, #ef4444, #dc2626);
  }
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

// Мини прогресс-бар (для таблицы)
.mini-progress {
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
  min-width: 60px;
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
}

.mini-progress-fill {
  height: 100%;
  border-radius: 3px;

  &.good {
    background: #22c55e;
  }
  &.medium {
    background: #f59e0b;
  }
  &.bad {
    background: #ef4444;
  }
}

.collection-rate {
  font-weight: 600;
  font-size: 0.9rem;

  &.good {
    color: #16a34a;
  }
  &.medium {
    color: #d97706;
  }
  &.bad {
    color: #dc2626;
  }
}

// Сумма долга
.debt-amount {
  color: var(--danger);
  font-weight: 700;

  &.total {
    font-size: 1.2rem;
  }
}

.debt-badge {
  background: #fef2f2;
  color: var(--danger);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
}

.collection-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;

  &.good {
    background: #dcfce7;
    color: #16a34a;
  }
  &.medium {
    background: #fef3c7;
    color: #d97706;
  }
  &.bad {
    background: #fef2f2;
    color: #dc2626;
  }
}

.balance-cell {
  font-weight: 600;

  &.debt {
    color: var(--danger);
  }
  &.overpaid {
    color: var(--success);
  }
  &.zero {
    color: var(--text-secondary);
  }
}

.balance-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;

  &.debt {
    background: #fef2f2;
    color: var(--danger);
  }
  &.overpaid {
    background: #dcfce7;
    color: var(--success);
  }
  &.zero {
    background: #f1f5f9;
    color: var(--text-secondary);
  }
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  font-weight: 600;
}

// Контакты в таблице должников
.contacts-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85rem;
  color: var(--text-secondary);

  i {
    margin-right: 6px;
    font-size: 0.75rem;
  }
}

// Мобильная карточка должника
.debtor-card {
  border-left: 4px solid var(--danger);
}

// Карточка периода
.period-card {
  .period-progress {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;

    .mini-progress {
      width: 100%;
      height: 8px;
    }
  }
}

// Stat value colors
.stat-value {
  &.good {
    color: #16a34a !important;
  }
  &.medium {
    color: #d97706 !important;
  }
  &.bad {
    color: #dc2626 !important;
  }
}
</style>
