<!-- src/views/TariffsView.vue -->

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAppToast } from "@/composables/useToast";
import { tariffsApi } from "@/api/tariffs";
import type { Tariff } from "@/types";
import ConfirmModal from "@/components/common/ConfirmModal.vue";

const toast = useAppToast();
const tariffs = ref<Tariff[]>([]);
const loading = ref(true);
const showForm = ref(false);
const editingTariff = ref<Tariff | null>(null);
const showConfirm = ref(false);
const toDelete = ref<Tariff | null>(null);

const form = ref({
  name: "",
  type: "membership" as Tariff["type"],
  rate: 0,
  unit: "",
  effective_from: "",
});

const typeLabels: Record<Tariff["type"], string> = {
  membership: "Членский",
  targeted: "Целевой",
  electricity: "Электричество",
  water: "Вода",
  garbage: "Мусор",
};

async function load() {
  loading.value = true;
  try {
    const { data } = await tariffsApi.getAll();
    tariffs.value = data;
  } catch {
    toast.error("Не удалось загрузить тарифы");
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function openCreate() {
  editingTariff.value = null;
  form.value = {
    name: "",
    type: "membership",
    rate: 0,
    unit: "участок",
    effective_from: new Date().toISOString().split("T")[0],
  };
  showForm.value = true;
}

function openEdit(t: Tariff) {
  editingTariff.value = t;
  form.value = { ...t };
  showForm.value = true;
}

async function save() {
  try {
    if (editingTariff.value) {
      await tariffsApi.update(editingTariff.value.id, form.value);
      toast.success("Тариф обновлён");
    } else {
      await tariffsApi.create(form.value as Omit<Tariff, "id">);
      toast.success("Тариф создан");
    }
    showForm.value = false;
    await load();
  } catch {
    toast.error("Не удалось сохранить тариф");
  }
}

async function confirmDel() {
  if (!toDelete.value) return;
  try {
    await tariffsApi.delete(toDelete.value.id);
    showConfirm.value = false;
    toast.success("Тариф удалён");
    await load();
  } catch {
    toast.error("Не удалось удалить тариф");
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">Тарифы</h2>
      <button class="btn btn-primary" @click="openCreate">
        <i class="pi pi-plus"></i> Добавить
      </button>
    </div>

    <div v-if="loading" class="loading">
      <i class="pi pi-spinner pi-spin"></i>
    </div>

    <div v-else class="cards-grid">
      <div v-for="t in tariffs" :key="t.id" class="card tariff-card">
        <div class="tariff-header">
          <span class="tariff-name">{{ t.name }}</span>
          <span class="badge badge-info">{{ typeLabels[t.type] }}</span>
        </div>
        <div class="tariff-rate">{{ t.rate }} ₽ / {{ t.unit }}</div>
        <div class="tariff-date">с {{ t.effective_from }}</div>
        <div class="tariff-actions">
          <button class="btn btn-sm btn-secondary" @click="openEdit(t)">
            <i class="pi pi-pencil"></i>
          </button>
          <button
            class="btn btn-sm btn-danger"
            @click="
              toDelete = t;
              showConfirm = true;
            "
          >
            <i class="pi pi-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Форма -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingTariff ? "Редактировать" : "Новый тариф" }}</h3>
          <button class="close-btn" @click="showForm = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <form @submit.prevent="save" class="modal-body">
          <div class="form-group">
            <label>Название</label>
            <input v-model="form.name" required />
          </div>
          <div class="form-group">
            <label>Тип</label>
            <select v-model="form.type">
              <option value="membership">Членский</option>
              <option value="targeted">Целевой</option>
              <option value="electricity">Электричество</option>
              <option value="water">Вода</option>
              <option value="garbage">Мусор</option>
            </select>
          </div>
          <div class="form-group">
            <label>Ставка (₽)</label>
            <input
              v-model.number="form.rate"
              type="number"
              step="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label>Единица</label>
            <input
              v-model="form.unit"
              placeholder="сотка / участок / кВт·ч"
              required
            />
          </div>
          <div class="form-group">
            <label>Действует с</label>
            <input v-model="form.effective_from" type="date" required />
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showForm = false"
            >
              Отмена
            </button>
            <button type="submit" class="btn btn-primary">Сохранить</button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmModal
      v-if="showConfirm"
      title="Удалить тариф?"
      :message="toDelete?.name || ''"
      confirm-text="Удалить"
      danger
      @close="showConfirm = false"
      @confirm="confirmDel"
    />
  </div>
</template>

<style lang="scss">
.tariff-card {
  .tariff-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .tariff-name {
    font-weight: 600;
    font-size: 1.1rem;
  }
  .tariff-rate {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 4px;
  }
  .tariff-date {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 12px;
  }
  .tariff-actions {
    display: flex;
    gap: 8px;
  }
}
</style>
