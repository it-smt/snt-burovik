<!-- src/views/AppealsView.vue -->

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useAppToast } from "@/composables/useToast";
import { useValidation } from "@/composables/useValidation";
import { appealsApi } from "@/api/appeals";
import { plotsApi } from "@/api/plots";
import type { Appeal, Plot } from "@/types";
import ConfirmModal from "@/components/common/ConfirmModal.vue";
import FormField from "@/components/common/FormField.vue";

const auth = useAuthStore();
const toast = useAppToast();
const appeals = ref<Appeal[]>([]);
const plots = ref<Plot[]>([]);
const loading = ref(true);
const statusFilter = ref("");

// Модалки
const showCreateForm = ref(false);
const showRespondForm = ref(false);
const showDetail = ref(false);
const selectedAppeal = ref<Appeal | null>(null);
const showConfirm = ref(false);
const toDelete = ref<Appeal | null>(null);

// Формы
const createForm = ref({
  plot_id: 0,
  subject: "",
  message: "",
});

const respondForm = ref({
  response: "",
  status: "resolved" as Appeal["status"],
});

// Валидация создания
const createValidation = useValidation(() => createForm.value, {
  plot_id: {
    required: true,
    min: 1,
    message: "Выберите участок",
  },
  subject: {
    required: true,
    minLength: 5,
    maxLength: 200,
    message: "Тема от 5 до 200 символов",
  },
  message: {
    required: true,
    minLength: 10,
    maxLength: 2000,
    message: "Сообщение от 10 до 2000 символов",
  },
});

// Валидация ответа
const respondValidation = useValidation(() => respondForm.value, {
  response: {
    required: true,
    minLength: 5,
    message: "Введите ответ (минимум 5 символов)",
  },
});

// Справочники
const statusLabels: Record<Appeal["status"], string> = {
  new: "Новое",
  in_progress: "В работе",
  resolved: "Решено",
  rejected: "Отклонено",
};

const statusColors: Record<Appeal["status"], string> = {
  new: "badge-info",
  in_progress: "badge-warning",
  resolved: "badge-success",
  rejected: "badge-danger",
};

const statusOptions = [
  { value: "", label: "Все статусы" },
  { value: "new", label: "Новые" },
  { value: "in_progress", label: "В работе" },
  { value: "resolved", label: "Решённые" },
  { value: "rejected", label: "Отклонённые" },
];

// Статистика
const stats = computed(() => ({
  total: appeals.value.length,
  new: appeals.value.filter((a) => a.status === "new").length,
  in_progress: appeals.value.filter((a) => a.status === "in_progress").length,
  resolved: appeals.value.filter(
    (a) => a.status === "resolved" || a.status === "rejected",
  ).length,
}));

// ========== Методы ==========

async function load() {
  loading.value = true;
  try {
    const [appealsRes, plotsRes] = await Promise.all([
      appealsApi.getAll({ status: statusFilter.value || undefined }),
      plotsApi.getAll(),
    ]);
    appeals.value = appealsRes.data.items;
    plots.value = plotsRes.data.items;
  } catch {
    toast.error("Не удалось загрузить обращения");
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function getPlotNumber(id: number) {
  return plots.value.find((p) => p.id === id)?.number || `#${id}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getAvailablePlots() {
  if (auth.isOwner) {
    return plots.value.filter((p) => p.owner_id === auth.user?.id);
  }
  return plots.value;
}

// Создание обращения
function openCreateForm() {
  const myPlots = getAvailablePlots();
  createForm.value = {
    plot_id: myPlots[0]?.id || 0,
    subject: "",
    message: "",
  };
  createValidation.resetErrors();
  showCreateForm.value = true;
}

async function saveAppeal() {
  if (!createValidation.validate()) return;
  try {
    await appealsApi.create(createForm.value);
    showCreateForm.value = false;
    createValidation.resetErrors();
    toast.success("Обращение отправлено");
    await load();
  } catch {
    toast.error("Не удалось создать обращение");
  }
}

// Детали
function openDetail(appeal: Appeal) {
  selectedAppeal.value = appeal;
  showDetail.value = true;
}

// Ответ
function openRespondForm(appeal: Appeal) {
  selectedAppeal.value = appeal;
  respondForm.value = {
    response: appeal.response || "",
    status:
      appeal.status === "new" || appeal.status === "in_progress"
        ? "resolved"
        : appeal.status,
  };
  respondValidation.resetErrors();
  showDetail.value = false;
  showRespondForm.value = true;
}

async function saveResponse() {
  if (!respondValidation.validate()) return;
  if (!selectedAppeal.value) return;
  try {
    await appealsApi.respond(selectedAppeal.value.id, respondForm.value);
    showRespondForm.value = false;
    respondValidation.resetErrors();
    toast.success("Ответ отправлен");
    await load();
  } catch {
    toast.error("Не удалось отправить ответ");
  }
}

// Удаление
async function confirmDelete() {
  if (!toDelete.value) return;
  try {
    await appealsApi.delete(toDelete.value.id);
    showConfirm.value = false;
    toDelete.value = null;
    toast.success("Обращение удалено");
    await load();
  } catch {
    toast.error("Не удалось удалить обращение");
  }
}
</script>

<template>
  <div class="appeals-page">
    <!-- Header -->
    <div class="page-header">
      <h2 class="page-title">Обращения</h2>
      <button class="btn btn-primary" @click="openCreateForm">
        <i class="pi pi-plus"></i>
        <span class="btn-text">Создать обращение</span>
      </button>
    </div>

    <!-- Статистика -->
    <div v-if="auth.isStaff" class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: #dbeafe">
          <i class="pi pi-envelope" style="color: #2563eb"></i>
        </div>
        <div>
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Всего</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #dbeafe">
          <i class="pi pi-inbox" style="color: #2563eb"></i>
        </div>
        <div>
          <div class="stat-value">{{ stats.new }}</div>
          <div class="stat-label">Новых</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #fef3c7">
          <i class="pi pi-clock" style="color: #d97706"></i>
        </div>
        <div>
          <div class="stat-value">{{ stats.in_progress }}</div>
          <div class="stat-label">В работе</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #dcfce7">
          <i class="pi pi-check-circle" style="color: #16a34a"></i>
        </div>
        <div>
          <div class="stat-value">{{ stats.resolved }}</div>
          <div class="stat-label">Закрыто</div>
        </div>
      </div>
    </div>

    <!-- Фильтры -->
    <div class="filters">
      <select v-model="statusFilter" class="select" @change="load">
        <option
          v-for="opt in statusOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="loading">
      <i class="pi pi-spinner pi-spin"></i>
      <span>Загрузка...</span>
    </div>

    <!-- Список обращений -->
    <div v-else class="appeals-list">
      <div
        v-for="appeal in appeals"
        :key="appeal.id"
        class="appeal-card card"
        @click="openDetail(appeal)"
      >
        <div class="appeal-header">
          <div class="appeal-title-row">
            <h3>{{ appeal.subject }}</h3>
            <span :class="['badge', statusColors[appeal.status]]">
              {{ statusLabels[appeal.status] }}
            </span>
          </div>
          <div class="appeal-meta">
            <span class="appeal-plot">
              <i class="pi pi-map"></i> Участок
              {{ getPlotNumber(appeal.plot_id) }}
            </span>
            <span class="appeal-date">
              <i class="pi pi-calendar"></i>
              {{ formatDate(appeal.created_at) }}
            </span>
          </div>
        </div>

        <p class="appeal-message">{{ appeal.message }}</p>

        <div v-if="appeal.response" class="appeal-response">
          <div class="response-header"><i class="pi pi-reply"></i> Ответ:</div>
          <p>{{ appeal.response }}</p>
        </div>

        <div class="appeal-actions" @click.stop>
          <template v-if="auth.isStaff">
            <button
              v-if="appeal.status === 'new' || appeal.status === 'in_progress'"
              class="btn btn-sm btn-primary"
              @click="openRespondForm(appeal)"
            >
              <i class="pi pi-reply"></i> Ответить
            </button>
            <button
              class="btn btn-sm btn-danger"
              @click="
                toDelete = appeal;
                showConfirm = true;
              "
            >
              <i class="pi pi-trash"></i>
            </button>
          </template>
        </div>
      </div>

      <div v-if="!appeals.length" class="empty-state">
        <i class="pi pi-envelope"></i>
        <p>Нет обращений</p>
      </div>
    </div>

    <!-- ========== Модалка: Детали обращения ========== -->
    <div
      v-if="showDetail && selectedAppeal"
      class="modal-overlay"
      @click.self="showDetail = false"
    >
      <div class="modal appeal-detail-modal">
        <div class="modal-header">
          <h3>Обращение</h3>
          <button class="close-btn" @click="showDetail = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <div class="detail-row">
              <span class="detail-label">Статус</span>
              <span :class="['badge', statusColors[selectedAppeal.status]]">
                {{ statusLabels[selectedAppeal.status] }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Участок</span>
              <span class="detail-value">{{
                getPlotNumber(selectedAppeal.plot_id)
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Дата</span>
              <span class="detail-value">{{
                formatDate(selectedAppeal.created_at)
              }}</span>
            </div>
            <div v-if="selectedAppeal.resolved_at" class="detail-row">
              <span class="detail-label">Закрыто</span>
              <span class="detail-value">{{
                formatDate(selectedAppeal.resolved_at)
              }}</span>
            </div>
          </div>

          <div class="detail-section">
            <h4>{{ selectedAppeal.subject }}</h4>
            <p class="detail-message">{{ selectedAppeal.message }}</p>
          </div>

          <div
            v-if="selectedAppeal.response"
            class="detail-section response-section"
          >
            <h4><i class="pi pi-reply"></i> Ответ</h4>
            <p class="detail-message">{{ selectedAppeal.response }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDetail = false">
            Закрыть
          </button>
          <button
            v-if="
              auth.isStaff &&
              (selectedAppeal.status === 'new' ||
                selectedAppeal.status === 'in_progress')
            "
            class="btn btn-primary"
            @click="openRespondForm(selectedAppeal)"
          >
            <i class="pi pi-reply"></i> Ответить
          </button>
        </div>
      </div>
    </div>

    <!-- ========== Модалка: Создание обращения ========== -->
    <div
      v-if="showCreateForm"
      class="modal-overlay"
      @click.self="showCreateForm = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h3>Новое обращение</h3>
          <button class="close-btn" @click="showCreateForm = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <form @submit.prevent="saveAppeal" class="modal-body">
          <FormField
            label="Участок"
            :error="createValidation.getError('plot_id')"
            required
          >
            <select
              v-model="createForm.plot_id"
              @change="createValidation.validateSingle('plot_id')"
            >
              <option :value="0" disabled>Выберите участок</option>
              <option
                v-for="p in getAvailablePlots()"
                :key="p.id"
                :value="p.id"
              >
                {{ p.number }} — {{ p.address }}
              </option>
            </select>
          </FormField>

          <FormField
            label="Тема обращения"
            :error="createValidation.getError('subject')"
            required
          >
            <input
              v-model="createForm.subject"
              type="text"
              placeholder="Кратко опишите проблему"
              @blur="createValidation.validateSingle('subject')"
            />
          </FormField>

          <FormField
            label="Сообщение"
            :error="createValidation.getError('message')"
            required
            hint="Подробно опишите ситуацию"
          >
            <textarea
              v-model="createForm.message"
              rows="5"
              placeholder="Подробно опишите ситуацию..."
              @blur="createValidation.validateSingle('message')"
            ></textarea>
          </FormField>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showCreateForm = false"
            >
              Отмена
            </button>
            <button type="submit" class="btn btn-primary">Отправить</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ========== Модалка: Ответ на обращение ========== -->
    <div
      v-if="showRespondForm && selectedAppeal"
      class="modal-overlay"
      @click.self="showRespondForm = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h3>Ответ на обращение</h3>
          <button class="close-btn" @click="showRespondForm = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <form @submit.prevent="saveResponse" class="modal-body">
          <div class="appeal-quote">
            <strong>{{ selectedAppeal.subject }}</strong>
            <p>{{ selectedAppeal.message }}</p>
          </div>

          <FormField label="Статус" required>
            <select v-model="respondForm.status">
              <option value="in_progress">В работе</option>
              <option value="resolved">Решено</option>
              <option value="rejected">Отклонено</option>
            </select>
          </FormField>

          <FormField
            label="Ответ"
            :error="respondValidation.getError('response')"
            required
          >
            <textarea
              v-model="respondForm.response"
              rows="5"
              placeholder="Введите ответ на обращение..."
              @blur="respondValidation.validateSingle('response')"
            ></textarea>
          </FormField>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showRespondForm = false"
            >
              Отмена
            </button>
            <button type="submit" class="btn btn-primary">
              Отправить ответ
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ========== Подтверждение удаления ========== -->
    <ConfirmModal
      v-if="showConfirm"
      title="Удалить обращение?"
      :message="toDelete?.subject || ''"
      confirm-text="Удалить"
      danger
      @close="showConfirm = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style lang="scss">
.appeals-page {
  .btn-text {
    @media (max-width: 480px) {
      display: none;
    }
  }
}

.appeals-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.appeal-card {
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
  }
}

.appeal-header {
  margin-bottom: 12px;
}

.appeal-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;

  h3 {
    margin: 0;
    font-size: 1.05rem;
    color: var(--text-primary);
    line-height: 1.4;
  }
}

.appeal-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.appeal-plot,
.appeal-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-secondary);

  i {
    font-size: 0.8rem;
  }
}

.appeal-message {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.appeal-response {
  background: #f0fdf4;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
  border-left: 3px solid var(--success);

  .response-header {
    font-weight: 600;
    color: #16a34a;
    margin-bottom: 4px;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  p {
    color: #475569;
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }
}

.appeal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

// Модалка деталей
.appeal-detail-modal {
  max-width: 560px;
}

.detail-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  h4 {
    margin: 0 0 8px;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.detail-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.detail-value {
  font-weight: 500;
  color: var(--text-primary);
}

.detail-message {
  color: #475569;
  line-height: 1.7;
  margin: 0;
}

.response-section {
  background: #f0fdf4;
  border-radius: 8px;
  padding: 16px;

  h4 {
    color: #16a34a;
  }
}

// Цитата в форме ответа
.appeal-quote {
  background: #f8fafc;
  border-left: 3px solid var(--primary);
  padding: 12px 16px;
  border-radius: 0 8px 8px 0;
  margin-bottom: 20px;

  strong {
    display: block;
    margin-bottom: 4px;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
  }
}
// В конец блока <style lang="scss">

.appeals-page {
  .stats-grid {
    margin-bottom: 20px;
  }

  .filters {
    margin-bottom: 20px;
  }
}
</style>
