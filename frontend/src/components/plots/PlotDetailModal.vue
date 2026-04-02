<!-- src/components/plots/PlotDetailModal.vue -->

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Plot, PlotBalance, Charge, Payment, MeterReading } from "@/types";
import { paymentsApi } from "@/api/payments";
import { metersApi } from "@/api/meters";

const props = defineProps<{
  plot: Plot;
  balance?: PlotBalance;
}>();

const emit = defineEmits<{
  close: [];
  edit: [];
}>();

const tab = ref<"info" | "payments" | "meters">("info");
const charges = ref<Charge[]>([]);
const payments = ref<Payment[]>([]);
const readings = ref<MeterReading[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const [c, p, r] = await Promise.all([
      paymentsApi.getCharges({ plot_id: props.plot.id }),
      paymentsApi.getPayments({ plot_id: props.plot.id }),
      metersApi.getReadings({ plot_id: props.plot.id }),
    ]);
    charges.value = c.data;
    payments.value = p.data;
    readings.value = r.data;
  } finally {
    loading.value = false;
  }
});

function formatMoney(n: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(n);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ru-RU");
}

const meterTypeLabels: Record<string, string> = {
  electricity: "Электричество",
  water_cold: "Холодная вода",
  water_hot: "Горячая вода",
};

const paymentMethodLabels: Record<string, string> = {
  cash: "Наличные",
  card: "Карта",
  bank_transfer: "Перевод",
  qr: "QR/СБП",
};
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal plot-detail-modal">
      <div class="modal-header">
        <div>
          <h3>Участок {{ plot.number }}</h3>
          <span class="plot-address-sub">{{ plot.address }}</span>
        </div>
        <button class="close-btn" @click="emit('close')">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- Табы -->
      <div class="detail-tabs">
        <button
          :class="['detail-tab', { active: tab === 'info' }]"
          @click="tab = 'info'"
        >
          <i class="pi pi-info-circle"></i> Информация
        </button>
        <button
          :class="['detail-tab', { active: tab === 'payments' }]"
          @click="tab = 'payments'"
        >
          <i class="pi pi-wallet"></i> Платежи
        </button>
        <button
          :class="['detail-tab', { active: tab === 'meters' }]"
          @click="tab = 'meters'"
        >
          <i class="pi pi-gauge"></i> Счётчики
        </button>
      </div>

      <div class="modal-body">
        <!-- Информация -->
        <div v-if="tab === 'info'" class="detail-content">
          <!-- Баланс -->
          <div
            class="balance-card"
            :class="{
              debt: (balance?.balance ?? 0) < 0,
              overpaid: (balance?.balance ?? 0) > 0,
            }"
          >
            <div class="balance-label">
              {{ (balance?.balance ?? 0) < 0 ? "Задолженность" : "Баланс" }}
            </div>
            <div class="balance-value">
              {{ (balance?.balance ?? 0) < 0 ? "-" : ""
              }}{{ formatMoney(Math.abs(balance?.balance ?? 0)) }}
            </div>
            <div class="balance-details">
              <span
                >Начислено: {{ formatMoney(balance?.total_charged ?? 0) }}</span
              >
              <span>Оплачено: {{ formatMoney(balance?.total_paid ?? 0) }}</span>
            </div>
          </div>

          <!-- Данные участка -->
          <div class="info-section">
            <h4>Характеристики</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Площадь</span>
                <span class="info-value">{{ plot.area_sqm }} м²</span>
              </div>
              <div class="info-item">
                <span class="info-label">Кадастровый номер</span>
                <span class="info-value">{{
                  plot.cadastral_number || "—"
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Электричество</span>
                <span class="info-value">
                  <i
                    :class="
                      plot.has_electricity
                        ? 'pi pi-check-circle'
                        : 'pi pi-times-circle'
                    "
                    :style="{
                      color: plot.has_electricity ? '#16a34a' : '#dc2626',
                    }"
                  ></i>
                  {{ plot.has_electricity ? "Подключено" : "Нет" }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Водоснабжение</span>
                <span class="info-value">
                  <i
                    :class="
                      plot.has_water
                        ? 'pi pi-check-circle'
                        : 'pi pi-times-circle'
                    "
                    :style="{ color: plot.has_water ? '#16a34a' : '#dc2626' }"
                  ></i>
                  {{ plot.has_water ? "Подключено" : "Нет" }}
                </span>
              </div>
            </div>
          </div>

          <!-- Владелец -->
          <div class="info-section">
            <h4>Владелец</h4>
            <div v-if="plot.owner" class="owner-info">
              <div class="owner-avatar">
                {{ plot.owner.full_name.charAt(0) }}
              </div>
              <div class="owner-details">
                <div class="owner-name">{{ plot.owner.full_name }}</div>
                <div class="owner-contacts">
                  <span
                    ><i class="pi pi-phone"></i> {{ plot.owner.phone }}</span
                  >
                </div>
              </div>
            </div>
            <div v-else class="no-owner-info">
              <i class="pi pi-user-minus"></i>
              <span>Владелец не назначен</span>
            </div>
          </div>
        </div>

        <!-- Платежи -->
        <div v-else-if="tab === 'payments'" class="detail-content">
          <div v-if="loading" class="loading-small">
            <i class="pi pi-spinner pi-spin"></i>
          </div>
          <template v-else>
            <!-- Начисления -->
            <div class="payments-section">
              <h4>Начисления ({{ charges.length }})</h4>
              <div v-if="charges.length" class="mini-list">
                <div v-for="c in charges" :key="c.id" class="mini-item">
                  <div class="mini-item-main">
                    <span class="mini-item-title">{{
                      c.description || "Начисление"
                    }}</span>
                    <span class="mini-item-date">{{ c.period }}</span>
                  </div>
                  <span class="mini-item-amount charges">
                    {{ formatMoney(c.amount) }}
                  </span>
                </div>
              </div>
              <div v-else class="mini-empty">Нет начислений</div>
            </div>

            <!-- Оплаты -->
            <div class="payments-section">
              <h4>Оплаты ({{ payments.length }})</h4>
              <div v-if="payments.length" class="mini-list">
                <div v-for="p in payments" :key="p.id" class="mini-item">
                  <div class="mini-item-main">
                    <span class="mini-item-title">
                      {{ paymentMethodLabels[p.payment_method] }}
                    </span>
                    <span class="mini-item-date">{{
                      formatDate(p.payment_date)
                    }}</span>
                  </div>
                  <span class="mini-item-amount payments">
                    {{ formatMoney(p.amount) }}
                  </span>
                </div>
              </div>
              <div v-else class="mini-empty">Нет оплат</div>
            </div>
          </template>
        </div>

        <!-- Счётчики -->
        <div v-else-if="tab === 'meters'" class="detail-content">
          <div v-if="loading" class="loading-small">
            <i class="pi pi-spinner pi-spin"></i>
          </div>
          <template v-else>
            <div v-if="readings.length" class="mini-list">
              <div v-for="r in readings" :key="r.id" class="mini-item">
                <div class="mini-item-main">
                  <span class="mini-item-title">{{
                    meterTypeLabels[r.meter_type]
                  }}</span>
                  <span class="mini-item-date">{{
                    formatDate(r.reading_date)
                  }}</span>
                </div>
                <div class="mini-item-right">
                  <span class="meter-value">{{ r.value }}</span>
                  <span
                    :class="[
                      'badge badge-sm',
                      r.is_verified ? 'badge-success' : 'badge-warning',
                    ]"
                  >
                    {{ r.is_verified ? "✓" : "?" }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="mini-empty">
              <i class="pi pi-gauge"></i>
              <span>Нет показаний</span>
            </div>
          </template>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="emit('close')">
          Закрыть
        </button>
        <button class="btn btn-primary" @click="emit('edit')">
          <i class="pi pi-pencil"></i> Редактировать
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.plot-detail-modal {
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;

  .modal-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    position: relative;

    .close-btn {
      position: absolute;
      top: 12px;
      right: 12px;
    }
  }

  .plot-address-sub {
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: normal;
  }
}

.detail-tabs {
  display: flex;
  gap: 4px;
  padding: 0 20px;
  border-bottom: 1px solid var(--border);
}

.detail-tab {
  padding: 12px 16px;
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.2s;

  &:hover {
    color: var(--text-primary);
  }

  &.active {
    color: var(--primary);
    border-bottom-color: var(--primary);
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 0.8rem;
  }
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// Balance card
.balance-card {
  padding: 20px;
  border-radius: 12px;
  text-align: center;

  &.debt {
    background: #fef2f2;
    .balance-value {
      color: var(--danger);
    }
  }

  &.overpaid {
    background: #f0fdf4;
    .balance-value {
      color: var(--success);
    }
  }

  &:not(.debt):not(.overpaid) {
    background: #f8fafc;
    .balance-value {
      color: var(--text-secondary);
    }
  }
}

.balance-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.balance-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.balance-details {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

// Info section
.info-section {
  h4 {
    margin: 0 0 12px;
    font-size: 0.9rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.info-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;

  .info-label {
    display: block;
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }

  .info-value {
    font-weight: 500;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 6px;

    i {
      font-size: 0.9rem;
    }
  }
}

// Owner info
.owner-info {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 10px;
}

.owner-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.owner-details {
  flex: 1;
  min-width: 0;
}

.owner-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.owner-contacts {
  font-size: 0.85rem;
  color: var(--text-secondary);

  i {
    margin-right: 6px;
  }
}

.no-owner-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 10px;
  color: var(--text-secondary);

  i {
    font-size: 1.5rem;
    opacity: 0.5;
  }
}

// Payments section
.payments-section {
  h4 {
    margin: 0 0 10px;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
}

.mini-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mini-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.mini-item-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mini-item-title {
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.mini-item-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.mini-item-amount {
  font-weight: 700;
  font-size: 0.95rem;

  &.charges {
    color: var(--danger);
  }
  &.payments {
    color: var(--success);
  }
}

.mini-item-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meter-value {
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-primary);
}

.badge-sm {
  padding: 2px 6px;
  font-size: 0.7rem;
}

.mini-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;

  i {
    font-size: 1.2rem;
    opacity: 0.5;
  }
}

.loading-small {
  display: flex;
  justify-content: center;
  padding: 40px;
  color: var(--text-secondary);
}
</style>
