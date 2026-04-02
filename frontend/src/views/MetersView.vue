<!-- src/views/MetersView.vue -->

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useAppToast } from "@/composables/useToast";
import { metersApi } from "@/api/meters";
import { plotsApi } from "@/api/plots";
import type { MeterReading, Plot } from "@/types";

const auth = useAuthStore();
const toast = useAppToast();
const readings = ref<MeterReading[]>([]);
const plots = ref<Plot[]>([]);
const loading = ref(true);
const showForm = ref(false);

const form = ref({
  plot_id: 0,
  meter_type: "electricity" as MeterReading["meter_type"],
  value: 0,
  reading_date: "",
});

const typeLabels: Record<string, string> = {
  electricity: "Электричество",
  water_cold: "Холодная вода",
  water_hot: "Горячая вода",
};

async function load() {
  loading.value = true;
  try {
    const [r, p] = await Promise.all([
      metersApi.getReadings(),
      plotsApi.getAll(),
    ]);
    readings.value = r.data;
    plots.value = p.data.items;
  } catch {
    toast.error("Не удалось загрузить показания");
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function getPlotNumber(id: number) {
  return plots.value.find((p) => p.id === id)?.number || "—";
}

function openForm() {
  form.value = {
    plot_id: plots.value[0]?.id || 0,
    meter_type: "electricity",
    value: 0,
    reading_date: new Date().toISOString().split("T")[0],
  };
  showForm.value = true;
}

async function save() {
  try {
    await metersApi.submitReading({
      ...form.value,
      submitted_by: auth.user?.id || 0,
    });
    showForm.value = false;
    toast.success("Показания переданы");
    await load();
  } catch {
    toast.error("Не удалось передать показания");
  }
}

async function verify(id: number) {
  try {
    await metersApi.verifyReading(id);
    toast.success("Показание подтверждено");
    await load();
  } catch {
    toast.error("Не удалось подтвердить показание");
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">Счётчики</h2>
      <button class="btn btn-primary" @click="openForm">
        <i class="pi pi-plus"></i> Передать показания
      </button>
    </div>

    <div v-if="loading" class="loading">
      <i class="pi pi-spinner pi-spin"></i>
    </div>

    <div v-else class="meters-list">
      <div v-for="r in readings" :key="r.id" class="mobile-card">
        <div class="mobile-card-header">
          <span class="mobile-card-title"
            >{{ getPlotNumber(r.plot_id) }} —
            {{ typeLabels[r.meter_type] }}</span
          >
          <span
            :class="[
              'badge',
              r.is_verified ? 'badge-success' : 'badge-warning',
            ]"
            >{{ r.is_verified ? "Проверено" : "На проверке" }}</span
          >
        </div>
        <div class="mobile-card-body">
          <div class="mobile-card-row">
            <span class="label">Показание</span
            ><span class="value" style="font-size: 1.2rem; font-weight: 700">{{
              r.value
            }}</span>
          </div>
          <div class="mobile-card-row">
            <span class="label">Дата</span
            ><span class="value">{{ r.reading_date }}</span>
          </div>
        </div>
        <div v-if="auth.isStaff && !r.is_verified" class="mobile-card-footer">
          <button class="btn btn-sm btn-primary" @click="verify(r.id)">
            <i class="pi pi-check"></i> Подтвердить
          </button>
        </div>
      </div>
      <div v-if="!readings.length" class="empty-state">
        <i class="pi pi-gauge"></i>
        <p>Нет показаний</p>
      </div>
    </div>

    <!-- Форма -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Передать показания</h3>
          <button class="close-btn" @click="showForm = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <form @submit.prevent="save" class="modal-body">
          <div class="form-group">
            <label>Участок</label
            ><select v-model="form.plot_id">
              <option v-for="p in plots" :key="p.id" :value="p.id">
                {{ p.number }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Тип счётчика</label
            ><select v-model="form.meter_type">
              <option value="electricity">Электричество</option>
              <option value="water_cold">Холодная вода</option>
              <option value="water_hot">Горячая вода</option>
            </select>
          </div>
          <div class="form-group">
            <label>Показание</label
            ><input v-model.number="form.value" type="number" required />
          </div>
          <div class="form-group">
            <label>Дата</label
            ><input v-model="form.reading_date" type="date" required />
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showForm = false"
            >
              Отмена</button
            ><button type="submit" class="btn btn-primary">Отправить</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.meters-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
