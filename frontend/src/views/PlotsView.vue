<!-- src/views/PlotsView.vue -->

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useAppToast } from "@/composables/useToast";
import {
  plotsApi,
  type CreatePlotData,
  type UpdatePlotData,
} from "@/api/plots";
import type { Plot, PlotBalance } from "@/types";
import PlotFormModal from "@/components/plots/PlotFormModal.vue";
import ConfirmModal from "@/components/common/ConfirmModal.vue";
import Pagination from "@/components/common/Pagination.vue";
import Skeleton from "@/components/common/Skeleton.vue";

const auth = useAuthStore();
const toast = useAppToast();
const plots = ref<Plot[]>([]);
const balances = ref<Map<number, PlotBalance>>(new Map());
const loading = ref(true);
const search = ref("");
const ownerFilter = ref<"" | "with" | "without">("");

// Пагинация
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const perPage = ref(10);

// Сортировка
const sortField = ref<"number" | "area_sqm" | "balance">("number");
const sortDir = ref<"asc" | "desc">("asc");

// Модалки
const showForm = ref(false);
const editingPlot = ref<Plot | null>(null);
const showConfirm = ref(false);
const plotToDelete = ref<Plot | null>(null);
const showDetail = ref(false);
const selectedPlot = ref<Plot | null>(null);

const filterOptions = [
  { value: "", label: "Все участки" },
  { value: "with", label: "С владельцем" },
  { value: "without", label: "Без владельца" },
];

// Сортированные данные
const sortedPlots = computed(() => {
  const data = [...plots.value];

  data.sort((a, b) => {
    let cmp = 0;

    if (sortField.value === "number") {
      cmp = a.number.localeCompare(b.number, "ru", { numeric: true });
    } else if (sortField.value === "area_sqm") {
      cmp = a.area_sqm - b.area_sqm;
    } else if (sortField.value === "balance") {
      const balA = balances.value.get(a.id)?.balance ?? 0;
      const balB = balances.value.get(b.id)?.balance ?? 0;
      cmp = balA - balB;
    }

    return sortDir.value === "asc" ? cmp : -cmp;
  });

  return data;
});

function toggleSort(field: typeof sortField.value) {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortDir.value = "asc";
  }
}

function getSortIcon(field: string) {
  if (sortField.value !== field) return "pi pi-sort-alt";
  return sortDir.value === "asc"
    ? "pi pi-sort-amount-up"
    : "pi pi-sort-amount-down";
}

async function loadPlots() {
  loading.value = true;
  try {
    const hasOwner =
      ownerFilter.value === "with"
        ? true
        : ownerFilter.value === "without"
          ? false
          : undefined;

    const { data } = await plotsApi.getAll({
      search: search.value || undefined,
      has_owner: hasOwner,
      page: currentPage.value,
      per_page: perPage.value,
    });
    plots.value = data.items;
    totalPages.value = data.pages;
    totalItems.value = data.total;

    const balancesRes = await plotsApi.getAllBalances();
    balances.value = new Map(balancesRes.data.map((b) => [b.plot_id, b]));
  } catch {
    toast.error("Не удалось загрузить участки");
  } finally {
    loading.value = false;
  }
}

onMounted(loadPlots);

function openCreateForm() {
  editingPlot.value = null;
  showForm.value = true;
}

function openEditForm(plot: Plot) {
  editingPlot.value = plot;
  showForm.value = true;
}

function openDetail(plot: Plot) {
  selectedPlot.value = plot;
  showDetail.value = true;
}

async function handleSave(data: CreatePlotData | UpdatePlotData) {
  try {
    if (editingPlot.value) {
      await plotsApi.update(editingPlot.value.id, data as UpdatePlotData);
      toast.success("Участок обновлён");
    } else {
      await plotsApi.create(data as CreatePlotData);
      toast.success("Участок создан");
    }
    showForm.value = false;
    await loadPlots();
  } catch (e: any) {
    const msg = e.response?.data?.detail || "Не удалось сохранить";
    toast.error(msg);
  }
}

function confirmDelete(plot: Plot) {
  plotToDelete.value = plot;
  showConfirm.value = true;
}

async function handleDelete() {
  if (!plotToDelete.value) return;
  try {
    await plotsApi.delete(plotToDelete.value.id);
    toast.success(`Участок ${plotToDelete.value.number} удалён`);
    showConfirm.value = false;
    plotToDelete.value = null;
    await loadPlots();
  } catch {
    toast.error("Не удалось удалить участок");
  }
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(Math.abs(amount));
}

function getBalanceClass(balance: number): string {
  if (balance < 0) return "debt";
  if (balance > 0) return "overpaid";
  return "zero";
}

function changePage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  loadPlots();
}

let searchTimeout: number;
function onSearchInput() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    loadPlots();
  }, 300);
}

function onFilterChange() {
  currentPage.value = 1;
  loadPlots();
}
</script>

<template>
  <div class="plots-page">
    <!-- Header -->
    <div class="page-header">
      <h2 class="page-title">Участки</h2>
      <button
        v-if="auth.isStaff"
        class="btn btn-primary"
        @click="openCreateForm"
      >
        <i class="pi pi-plus"></i>
        <span class="btn-text">Добавить</span>
      </button>
    </div>

    <!-- Фильтры -->
    <div class="filters">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input
          v-model="search"
          type="text"
          placeholder="Поиск по номеру, адресу, владельцу..."
          @input="onSearchInput"
        />
      </div>

      <select v-model="ownerFilter" class="select" @change="onFilterChange">
        <option
          v-for="opt in filterOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Скелетон загрузки -->
    <template v-if="loading">
      <Skeleton type="stat" :count="3" />
      <Skeleton type="table" :count="5" />
      <Skeleton type="card" :count="3" />
    </template>

    <template v-else>
      <!-- Статистика -->
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-value">{{ totalItems }}</span>
          <span class="stat-label">участков</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{
            plots.filter((p) => p.owner_id).length
          }}</span>
          <span class="stat-label">с владельцем</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{
            plots.filter((p) => !p.owner_id).length
          }}</span>
          <span class="stat-label">свободных</span>
        </div>
      </div>

      <!-- Десктоп таблица -->
      <div class="table-container">
        <table class="data-table sortable-table">
          <thead>
            <tr>
              <th class="sortable" @click="toggleSort('number')">
                Участок
                <i :class="getSortIcon('number')"></i>
              </th>
              <th>Владелец</th>
              <th class="sortable" @click="toggleSort('area_sqm')">
                Площадь
                <i :class="getSortIcon('area_sqm')"></i>
              </th>
              <th>Подключения</th>
              <th class="sortable" @click="toggleSort('balance')">
                Баланс
                <i :class="getSortIcon('balance')"></i>
              </th>
              <th v-if="auth.isStaff">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="plot in sortedPlots"
              :key="plot.id"
              class="clickable-row"
              @click="openDetail(plot)"
            >
              <td>
                <div class="plot-cell">
                  <span class="plot-number">{{ plot.number }}</span>
                  <span class="plot-address">{{ plot.address }}</span>
                </div>
              </td>
              <td>
                <template v-if="plot.owner">
                  <div class="owner-cell">
                    <span class="owner-name">{{ plot.owner.full_name }}</span>
                    <span class="owner-phone">{{ plot.owner.phone }}</span>
                  </div>
                </template>
                <span v-else class="no-owner">Нет владельца</span>
              </td>
              <td>
                <span class="area">{{ plot.area_sqm }} м²</span>
              </td>
              <td>
                <div class="connections">
                  <span
                    class="conn-badge"
                    :class="{ active: plot.has_electricity }"
                    title="Электричество"
                  >
                    <i class="pi pi-bolt"></i>
                  </span>
                  <span
                    class="conn-badge"
                    :class="{ active: plot.has_water }"
                    title="Вода"
                  >
                    <i class="pi pi-box"></i>
                  </span>
                </div>
              </td>
              <td>
                <span
                  class="balance-cell"
                  :class="getBalanceClass(balances.get(plot.id)?.balance ?? 0)"
                >
                  {{ (balances.get(plot.id)?.balance ?? 0) < 0 ? "-" : ""
                  }}{{ formatMoney(balances.get(plot.id)?.balance ?? 0) }}
                </span>
              </td>
              <td v-if="auth.isStaff" @click.stop>
                <div class="table-actions">
                  <button
                    class="action-btn"
                    title="Редактировать"
                    @click="openEditForm(plot)"
                  >
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button
                    class="action-btn danger"
                    title="Удалить"
                    @click="confirmDelete(plot)"
                  >
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="plots.length === 0">
              <td :colspan="auth.isStaff ? 6 : 5" class="empty-row">
                Участки не найдены
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Мобильные карточки -->
      <div class="mobile-cards">
        <div
          v-for="plot in sortedPlots"
          :key="plot.id"
          class="mobile-card plot-mobile-card"
          @click="openDetail(plot)"
        >
          <div class="mobile-card-header">
            <div class="plot-cell">
              <span class="plot-number">{{ plot.number }}</span>
              <span class="plot-address">{{ plot.address }}</span>
            </div>
            <span
              class="balance-badge"
              :class="getBalanceClass(balances.get(plot.id)?.balance ?? 0)"
            >
              {{ (balances.get(plot.id)?.balance ?? 0) < 0 ? "-" : ""
              }}{{ formatMoney(balances.get(plot.id)?.balance ?? 0) }}
            </span>
          </div>

          <div class="mobile-card-body">
            <div class="mobile-card-row">
              <span class="label">Владелец</span>
              <span class="value">
                {{ plot.owner?.full_name || "Нет владельца" }}
              </span>
            </div>
            <div class="mobile-card-row">
              <span class="label">Площадь</span>
              <span class="value">{{ plot.area_sqm }} м²</span>
            </div>
            <div class="mobile-card-row">
              <span class="label">Подключения</span>
              <span class="value connections">
                <span
                  class="conn-badge"
                  :class="{ active: plot.has_electricity }"
                >
                  <i class="pi pi-bolt"></i>
                </span>
                <span class="conn-badge" :class="{ active: plot.has_water }">
                  <i class="pi pi-box"></i>
                </span>
              </span>
            </div>
          </div>

          <div v-if="auth.isStaff" class="mobile-card-footer" @click.stop>
            <button
              class="btn btn-sm btn-secondary"
              @click="openEditForm(plot)"
            >
              <i class="pi pi-pencil"></i> Изменить
            </button>
            <button class="btn btn-sm btn-danger" @click="confirmDelete(plot)">
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>

        <div v-if="plots.length === 0" class="empty-state">
          <i class="pi pi-map"></i>
          <p>Участки не найдены</p>
          <button
            v-if="auth.isStaff"
            class="btn btn-primary"
            style="margin-top: 12px"
            @click="openCreateForm"
          >
            <i class="pi pi-plus"></i> Добавить первый участок
          </button>
        </div>
      </div>

      <!-- Пагинация -->
      <Pagination
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-items="totalItems"
        @change="changePage"
      />
    </template>

    <!-- Модалка деталей участка -->
    <PlotDetailModal
      v-if="showDetail && selectedPlot"
      :plot="selectedPlot"
      :balance="balances.get(selectedPlot.id)"
      @close="showDetail = false"
      @edit="
        openEditForm(selectedPlot!);
        showDetail = false;
      "
    />

    <!-- Модалки -->
    <PlotFormModal
      v-if="showForm"
      :plot="editingPlot"
      @close="showForm = false"
      @save="handleSave"
    />

    <ConfirmModal
      v-if="showConfirm"
      title="Удалить участок?"
      :message="`Вы уверены, что хотите удалить участок ${plotToDelete?.number}?`"
      confirm-text="Удалить"
      danger
      @close="showConfirm = false"
      @confirm="handleDelete"
    />
  </div>
</template>

<style lang="scss">
.plots-page {
  .btn-text {
    @media (max-width: 480px) {
      display: none;
    }
  }
}

.stats-row {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 16px;
  }
}

.stat-item {
  display: flex;
  align-items: baseline;
  gap: 6px;

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary);
  }

  .stat-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
}

// Сортируемая таблица
.sortable-table {
  th.sortable {
    cursor: pointer;
    user-select: none;
    transition: background 0.15s;

    &:hover {
      background: #f1f5f9;
    }

    i {
      margin-left: 6px;
      font-size: 0.75rem;
      opacity: 0.5;
    }
  }
}

.clickable-row {
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #f8fafc !important;
  }
}

.plot-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .plot-number {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 1rem;
  }

  .plot-address {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
}

.owner-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .owner-name {
    font-weight: 500;
    color: var(--text-primary);
  }

  .owner-phone {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
}

.no-owner {
  color: var(--text-secondary);
  font-style: italic;
}

.area {
  font-weight: 500;
  white-space: nowrap;
}

.connections {
  display: flex;
  gap: 8px;
}

.conn-badge {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #94a3b8;

  &.active {
    background: #dcfce7;
    color: #16a34a;
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

.plot-mobile-card {
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
  }

  .mobile-card-header {
    align-items: flex-start;
  }
  .connections {
    justify-content: flex-end;
  }
}

.table-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #334155;
  }

  &.danger:hover {
    background: #fef2f2;
    color: var(--danger);
  }
}
</style>
