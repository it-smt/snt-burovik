<!-- src/views/PaymentsView.vue -->

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useAppToast } from "@/composables/useToast";
import { paymentsApi, type MassChargeData } from "@/api/payments";
import { plotsApi } from "@/api/plots";
import { tariffsApi } from "@/api/tariffs";
import type { Charge, Payment, Plot, Tariff } from "@/types";

const auth = useAuthStore();
const toast = useAppToast();
const charges = ref<Charge[]>([]);
const payments = ref<Payment[]>([]);
const plots = ref<Plot[]>([]);
const tariffs = ref<Tariff[]>([]);
const loading = ref(true);
const tab = ref<"charges" | "payments">("charges");

// Фильтры
const filterPlotId = ref<number | "">("");
const filterPeriod = ref("");

// Формы
const showChargeForm = ref(false);
const showPaymentForm = ref(false);
const showMassChargeForm = ref(false);
const massChargeLoading = ref(false);

const chargeForm = ref({
  plot_id: 0,
  tariff_id: 0,
  period: "",
  amount: 0,
  description: "",
});
const paymentForm = ref({
  plot_id: 0,
  amount: 0,
  payment_date: "",
  payment_method: "cash" as Payment["payment_method"],
  description: "",
});
const massChargeForm = ref({
  tariff_id: 0,
  period: "",
  description: "",
  amount_per_plot: 0,
  apply_to: "all" as "all" | "selected",
  selected_plots: [] as number[],
});

// Фильтрованные данные
const filteredCharges = computed(() => {
  let data = [...charges.value];
  if (filterPlotId.value) {
    data = data.filter((c) => c.plot_id === filterPlotId.value);
  }
  if (filterPeriod.value) {
    data = data.filter((c) => c.period === filterPeriod.value);
  }
  return data;
});

const filteredPayments = computed(() => {
  let data = [...payments.value];
  if (filterPlotId.value) {
    data = data.filter((p) => p.plot_id === filterPlotId.value);
  }
  return data;
});

// Доступные периоды из данных
const availablePeriods = computed(() => {
  const periods = new Set(charges.value.map((c) => c.period));
  return [...periods].sort().reverse();
});

async function load() {
  loading.value = true;
  try {
    const ownerPlotFilter = auth.isOwner ? { plot_id: undefined } : {};
    const [c, p, pl, t] = await Promise.all([
      paymentsApi.getCharges(),
      paymentsApi.getPayments(),
      plotsApi.getAll(),
      tariffsApi.getAll(),
    ]);
    charges.value = c.data;
    payments.value = p.data;
    plots.value = pl.data.items;
    tariffs.value = t.data;

    // Для владельца фильтруем по его участкам
    if (auth.isOwner && auth.user) {
      const myPlotIds = plots.value
        .filter((p) => p.owner_id === auth.user!.id)
        .map((p) => p.id);
      charges.value = charges.value.filter((c) =>
        myPlotIds.includes(c.plot_id),
      );
      payments.value = payments.value.filter((p) =>
        myPlotIds.includes(p.plot_id),
      );
    }
  } catch {
    toast.error("Не удалось загрузить данные");
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function getPlotNumber(id: number) {
  return plots.value.find((p) => p.id === id)?.number || "—";
}
function getTariffName(id: number) {
  return tariffs.value.find((t) => t.id === id)?.name || "—";
}

function openChargeForm() {
  chargeForm.value = {
    plot_id: plots.value[0]?.id || 0,
    tariff_id: tariffs.value[0]?.id || 0,
    period: new Date().toISOString().slice(0, 7),
    amount: 0,
    description: "",
  };
  showChargeForm.value = true;
}

function openPaymentForm() {
  paymentForm.value = {
    plot_id: plots.value[0]?.id || 0,
    amount: 0,
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "cash",
    description: "",
  };
  showPaymentForm.value = true;
}

function openMassChargeForm() {
  massChargeForm.value = {
    tariff_id: tariffs.value[0]?.id || 0,
    period: new Date().toISOString().slice(0, 7),
    description: "",
    amount_per_plot: 0,
    apply_to: "all",
    selected_plots: [],
  };
  showMassChargeForm.value = true;
}

async function saveCharge() {
  try {
    await paymentsApi.createCharge(chargeForm.value);
    showChargeForm.value = false;
    toast.success("Начисление создано");
    await load();
  } catch {
    toast.error("Не удалось создать начисление");
  }
}

async function savePayment() {
  try {
    await paymentsApi.createPayment({
      ...paymentForm.value,
      recorded_by: auth.user?.id || 0,
    });
    showPaymentForm.value = false;
    toast.success("Оплата записана");
    await load();
  } catch {
    toast.error("Не удалось записать оплату");
  }
}

async function saveMassCharge() {
  massChargeLoading.value = true;
  try {
    const data: MassChargeData = {
      tariff_id: massChargeForm.value.tariff_id,
      period: massChargeForm.value.period,
      description: massChargeForm.value.description,
      plot_ids:
        massChargeForm.value.apply_to === "all"
          ? []
          : massChargeForm.value.selected_plots,
      amount_per_plot: massChargeForm.value.amount_per_plot || undefined,
    };

    const { data: result } = await paymentsApi.createMassCharge(data);
    showMassChargeForm.value = false;

    if (result.skipped_count > 0) {
      toast.warn(
        `Создано ${result.created_count} начислений. Пропущено ${result.skipped_count} (уже существуют).`,
      );
    } else {
      toast.success(
        `Создано ${result.created_count} начислений на ${formatMoney(result.total_amount)}`,
      );
    }
    await load();
  } catch {
    toast.error("Не удалось создать массовые начисления");
  } finally {
    massChargeLoading.value = false;
  }
}

function clearFilters() {
  filterPlotId.value = "";
  filterPeriod.value = "";
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(n);
}

const methodLabels: Record<string, string> = {
  cash: "Наличные",
  card: "Карта",
  bank_transfer: "Перевод",
  qr: "QR/СБП",
};

// Участки с владельцем (для массового начисления)
const plotsWithOwner = computed(() => plots.value.filter((p) => p.owner_id));

function togglePlotSelection(plotId: number) {
  const idx = massChargeForm.value.selected_plots.indexOf(plotId);
  if (idx === -1) {
    massChargeForm.value.selected_plots.push(plotId);
  } else {
    massChargeForm.value.selected_plots.splice(idx, 1);
  }
}

function selectAllPlots() {
  massChargeForm.value.selected_plots = plotsWithOwner.value.map((p) => p.id);
}

function deselectAllPlots() {
  massChargeForm.value.selected_plots = [];
}

// Итого по фильтрованным данным
const chargesTotalAmount = computed(() =>
  filteredCharges.value.reduce((sum, c) => sum + c.amount, 0),
);
const paymentsTotalAmount = computed(() =>
  filteredPayments.value.reduce((sum, p) => sum + p.amount, 0),
);
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">Платежи</h2>
      <div v-if="auth.isStaff" class="header-actions">
        <button class="btn btn-secondary" @click="openMassChargeForm">
          <i class="pi pi-list"></i>
          <span class="btn-text">Массовое</span>
        </button>
        <button class="btn btn-secondary" @click="openChargeForm">
          <i class="pi pi-plus"></i>
          <span class="btn-text">Начисление</span>
        </button>
        <button class="btn btn-primary" @click="openPaymentForm">
          <i class="pi pi-plus"></i>
          <span class="btn-text">Оплата</span>
        </button>
      </div>
    </div>

    <!-- Табы -->
    <div class="tabs">
      <button
        :class="['tab', { active: tab === 'charges' }]"
        @click="tab = 'charges'"
      >
        Начисления ({{ filteredCharges.length }})
      </button>
      <button
        :class="['tab', { active: tab === 'payments' }]"
        @click="tab = 'payments'"
      >
        Оплаты ({{ filteredPayments.length }})
      </button>
    </div>

    <!-- Фильтры -->
    <div class="filters">
      <select v-model="filterPlotId" class="select">
        <option value="">Все участки</option>
        <option v-for="p in plots" :key="p.id" :value="p.id">
          {{ p.number }}
        </option>
      </select>

      <select v-if="tab === 'charges'" v-model="filterPeriod" class="select">
        <option value="">Все периоды</option>
        <option v-for="p in availablePeriods" :key="p" :value="p">
          {{ p }}
        </option>
      </select>

      <button
        v-if="filterPlotId || filterPeriod"
        class="btn btn-sm btn-secondary"
        @click="clearFilters"
      >
        <i class="pi pi-times"></i> Сбросить
      </button>
    </div>

    <div v-if="loading" class="loading">
      <i class="pi pi-spinner pi-spin"></i>
    </div>

    <!-- Начисления -->
    <div v-else-if="tab === 'charges'">
      <!-- Итого -->
      <div v-if="filteredCharges.length" class="total-bar">
        <span>Итого начислено:</span>
        <span class="total-amount charges">{{
          formatMoney(chargesTotalAmount)
        }}</span>
      </div>

      <div class="payments-list">
        <div v-for="c in filteredCharges" :key="c.id" class="mobile-card">
          <div class="mobile-card-header">
            <span class="mobile-card-title">{{
              getPlotNumber(c.plot_id)
            }}</span>
            <span class="badge badge-warning">{{ c.period }}</span>
          </div>
          <div class="mobile-card-body">
            <div class="mobile-card-row">
              <span class="label">Тариф</span>
              <span class="value">{{ getTariffName(c.tariff_id) }}</span>
            </div>
            <div class="mobile-card-row">
              <span class="label">Сумма</span>
              <span
                class="value"
                style="font-weight: 700; color: var(--danger)"
              >
                {{ formatMoney(c.amount) }}
              </span>
            </div>
            <div v-if="c.description" class="mobile-card-row">
              <span class="label">Описание</span>
              <span class="value">{{ c.description }}</span>
            </div>
          </div>
        </div>
        <div v-if="!filteredCharges.length" class="empty-state">
          <i class="pi pi-file"></i>
          <p>Нет начислений</p>
          <button
            v-if="auth.isStaff && !filterPlotId && !filterPeriod"
            class="btn btn-primary"
            style="margin-top: 12px"
            @click="openMassChargeForm"
          >
            <i class="pi pi-list"></i> Создать массовое начисление
          </button>
        </div>
      </div>
    </div>

    <!-- Оплаты -->
    <div v-else>
      <div v-if="filteredPayments.length" class="total-bar">
        <span>Итого оплачено:</span>
        <span class="total-amount payments">{{
          formatMoney(paymentsTotalAmount)
        }}</span>
      </div>

      <div class="payments-list">
        <div v-for="p in filteredPayments" :key="p.id" class="mobile-card">
          <div class="mobile-card-header">
            <span class="mobile-card-title">{{
              getPlotNumber(p.plot_id)
            }}</span>
            <span class="badge badge-success">{{ p.payment_date }}</span>
          </div>
          <div class="mobile-card-body">
            <div class="mobile-card-row">
              <span class="label">Сумма</span>
              <span
                class="value"
                style="font-weight: 700; color: var(--success)"
              >
                {{ formatMoney(p.amount) }}
              </span>
            </div>
            <div class="mobile-card-row">
              <span class="label">Способ</span>
              <span class="value">{{ methodLabels[p.payment_method] }}</span>
            </div>
            <div v-if="p.description" class="mobile-card-row">
              <span class="label">Описание</span>
              <span class="value">{{ p.description }}</span>
            </div>
          </div>
        </div>
        <div v-if="!filteredPayments.length" class="empty-state">
          <i class="pi pi-wallet"></i>
          <p>Нет оплат</p>
          <button
            v-if="auth.isStaff && !filterPlotId"
            class="btn btn-primary"
            style="margin-top: 12px"
            @click="openPaymentForm"
          >
            <i class="pi pi-plus"></i> Записать оплату
          </button>
        </div>
      </div>
    </div>

    <!-- Форма начисления -->
    <div
      v-if="showChargeForm"
      class="modal-overlay"
      @click.self="showChargeForm = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h3>Новое начисление</h3>
          <button class="close-btn" @click="showChargeForm = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <form @submit.prevent="saveCharge" class="modal-body">
          <div class="form-group">
            <label>Участок</label>
            <select v-model="chargeForm.plot_id">
              <option v-for="p in plots" :key="p.id" :value="p.id">
                {{ p.number }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Тариф</label>
            <select v-model="chargeForm.tariff_id">
              <option v-for="t in tariffs" :key="t.id" :value="t.id">
                {{ t.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Период</label>
            <input v-model="chargeForm.period" type="month" />
          </div>
          <div class="form-group">
            <label>Сумма</label>
            <input v-model.number="chargeForm.amount" type="number" />
          </div>
          <div class="form-group">
            <label>Описание</label>
            <input v-model="chargeForm.description" />
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showChargeForm = false"
            >
              Отмена
            </button>
            <button type="submit" class="btn btn-primary">Создать</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Форма оплаты -->
    <div
      v-if="showPaymentForm"
      class="modal-overlay"
      @click.self="showPaymentForm = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h3>Новая оплата</h3>
          <button class="close-btn" @click="showPaymentForm = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <form @submit.prevent="savePayment" class="modal-body">
          <div class="form-group">
            <label>Участок</label>
            <select v-model="paymentForm.plot_id">
              <option v-for="p in plots" :key="p.id" :value="p.id">
                {{ p.number }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Сумма</label>
            <input v-model.number="paymentForm.amount" type="number" />
          </div>
          <div class="form-group">
            <label>Дата</label>
            <input v-model="paymentForm.payment_date" type="date" />
          </div>
          <div class="form-group">
            <label>Способ</label>
            <select v-model="paymentForm.payment_method">
              <option value="cash">Наличные</option>
              <option value="card">Карта</option>
              <option value="bank_transfer">Перевод</option>
              <option value="qr">QR/СБП</option>
            </select>
          </div>
          <div class="form-group">
            <label>Описание</label>
            <input v-model="paymentForm.description" />
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showPaymentForm = false"
            >
              Отмена
            </button>
            <button type="submit" class="btn btn-primary">Создать</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Массовое начисление -->
    <div
      v-if="showMassChargeForm"
      class="modal-overlay"
      @click.self="showMassChargeForm = false"
    >
      <div class="modal mass-charge-modal">
        <div class="modal-header">
          <h3>Массовое начисление</h3>
          <button class="close-btn" @click="showMassChargeForm = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <form @submit.prevent="saveMassCharge" class="modal-body">
          <div class="mass-charge-info">
            <i class="pi pi-info-circle"></i>
            <span
              >Начисление будет создано для всех выбранных участков за указанный
              период</span
            >
          </div>

          <div class="form-group">
            <label>Тариф</label>
            <select v-model="massChargeForm.tariff_id">
              <option v-for="t in tariffs" :key="t.id" :value="t.id">
                {{ t.name }} — {{ t.rate }} ₽ / {{ t.unit }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Период</label>
            <input v-model="massChargeForm.period" type="month" required />
          </div>
          <div class="form-group">
            <label>Сумма на участок (₽)</label>
            <input
              v-model.number="massChargeForm.amount_per_plot"
              type="number"
              min="0"
              step="0.01"
              placeholder="0 = рассчитать по тарифу"
            />
            <span class="hint-text"
              >Оставьте 0 для автоматического расчёта</span
            >
          </div>
          <div class="form-group">
            <label>Описание</label>
            <input
              v-model="massChargeForm.description"
              placeholder="Членский взнос за январь 2025"
            />
          </div>

          <div class="form-group">
            <label>Участки</label>
            <div class="apply-to-selector">
              <label class="radio-label">
                <input
                  type="radio"
                  v-model="massChargeForm.apply_to"
                  value="all"
                />
                <span>Все с владельцем ({{ plotsWithOwner.length }} уч.)</span>
              </label>
              <label class="radio-label">
                <input
                  type="radio"
                  v-model="massChargeForm.apply_to"
                  value="selected"
                />
                <span>Выбрать вручную</span>
              </label>
            </div>
          </div>

          <!-- Выбор участков -->
          <div
            v-if="massChargeForm.apply_to === 'selected'"
            class="plots-selector"
          >
            <div class="plots-selector-actions">
              <button
                type="button"
                class="btn btn-sm btn-secondary"
                @click="selectAllPlots"
              >
                Выбрать все
              </button>
              <button
                type="button"
                class="btn btn-sm btn-secondary"
                @click="deselectAllPlots"
              >
                Снять все
              </button>
              <span class="selected-count">
                Выбрано: {{ massChargeForm.selected_plots.length }}
              </span>
            </div>
            <div class="plots-checkbox-list">
              <label
                v-for="p in plotsWithOwner"
                :key="p.id"
                class="plot-checkbox"
                :class="{
                  checked: massChargeForm.selected_plots.includes(p.id),
                }"
              >
                <input
                  type="checkbox"
                  :checked="massChargeForm.selected_plots.includes(p.id)"
                  @change="togglePlotSelection(p.id)"
                />
                <span class="plot-checkbox-info">
                  <strong>{{ p.number }}</strong>
                  <span>{{ p.owner?.full_name || "—" }}</span>
                </span>
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showMassChargeForm = false"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="massChargeLoading"
            >
              <i
                :class="
                  massChargeLoading ? 'pi pi-spinner pi-spin' : 'pi pi-check'
                "
              ></i>
              Создать начисления
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.header-actions {
  display: flex;
  gap: 8px;

  @media (max-width: 640px) {
    .btn-text {
      display: none;
    }
  }
}

.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
}
.tab {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  &.active {
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    color: var(--primary);
  }
}

.payments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.total-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: 10px;
  margin-bottom: 16px;
  font-weight: 500;

  .total-amount {
    font-size: 1.1rem;
    font-weight: 700;

    &.charges {
      color: var(--danger);
    }
    &.payments {
      color: var(--success);
    }
  }
}

// Массовое начисление
.mass-charge-modal {
  max-width: 560px;
}

.mass-charge-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  background: #eff6ff;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.85rem;
  color: #1e40af;

  i {
    margin-top: 2px;
    flex-shrink: 0;
  }
}

.hint-text {
  display: block;
  margin-top: 4px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.apply-to-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.95rem;

  input[type="radio"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
}

.plots-selector {
  margin-top: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.plots-selector-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f8fafc;
  border-bottom: 1px solid var(--border);

  .selected-count {
    margin-left: auto;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
}

.plots-checkbox-list {
  max-height: 200px;
  overflow-y: auto;
}

.plot-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8fafc;
  }

  &.checked {
    background: #eff6ff;
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .plot-checkbox-info {
    display: flex;
    flex-direction: column;
    gap: 1px;

    strong {
      font-size: 0.9rem;
      color: var(--text-primary);
    }

    span {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
  }
}
</style>
