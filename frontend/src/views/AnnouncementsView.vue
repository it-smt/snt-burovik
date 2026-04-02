<!-- src/views/AnnouncementsView.vue -->

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useAppToast } from "@/composables/useToast";
import { announcementsApi } from "@/api/announcements";
import type { Announcement } from "@/types";
import ConfirmModal from "@/components/common/ConfirmModal.vue";
import Skeleton from "@/components/common/Skeleton.vue";

const auth = useAuthStore();
const toast = useAppToast();
const announcements = ref<Announcement[]>([]);
const loading = ref(true);
const showForm = ref(false);
const showConfirm = ref(false);
const toDelete = ref<Announcement | null>(null);

const form = ref({ title: "", content: "", is_important: false });

async function load() {
  loading.value = true;
  try {
    const { data } = await announcementsApi.getAll();
    announcements.value = data.items;
  } catch {
    toast.error("Не удалось загрузить объявления");
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function openForm() {
  form.value = { title: "", content: "", is_important: false };
  showForm.value = true;
}

async function save() {
  if (!form.value.title.trim() || !form.value.content.trim()) {
    toast.warn("Заполните все поля");
    return;
  }
  try {
    await announcementsApi.create({
      ...form.value,
      author_id: auth.user?.id || 0,
    });
    showForm.value = false;
    toast.success("Объявление опубликовано");
    await load();
  } catch {
    toast.error("Не удалось создать объявление");
  }
}

async function confirmDel() {
  if (!toDelete.value) return;
  try {
    await announcementsApi.delete(toDelete.value.id);
    showConfirm.value = false;
    toast.success("Объявление удалено");
    await load();
  } catch {
    toast.error("Не удалось удалить объявление");
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">Объявления</h2>
      <button v-if="auth.isStaff" class="btn btn-primary" @click="openForm">
        <i class="pi pi-plus"></i>
        <span class="btn-text">Создать</span>
      </button>
    </div>

    <!-- Скелетон -->
    <template v-if="loading">
      <Skeleton type="card" :count="3" />
    </template>

    <template v-else>
      <div class="announcements-list">
        <div
          v-for="a in announcements"
          :key="a.id"
          :class="['announcement-card card', { important: a.is_important }]"
        >
          <div class="ann-header">
            <h3>{{ a.title }}</h3>
            <span v-if="a.is_important" class="badge badge-danger">Важно</span>
          </div>
          <p>{{ a.content }}</p>
          <div class="ann-footer">
            <span class="ann-date">{{ formatDate(a.published_at) }}</span>
            <button
              v-if="auth.isStaff"
              class="btn btn-sm btn-danger"
              @click="
                toDelete = a;
                showConfirm = true;
              "
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>

        <!-- Пустое состояние с CTA -->
        <div v-if="!announcements.length" class="empty-state">
          <i class="pi pi-megaphone"></i>
          <p>Нет объявлений</p>
          <button
            v-if="auth.isStaff"
            class="btn btn-primary"
            style="margin-top: 12px"
            @click="openForm"
          >
            <i class="pi pi-plus"></i> Создать первое объявление
          </button>
        </div>
      </div>
    </template>

    <!-- Форма -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Новое объявление</h3>
          <button class="close-btn" @click="showForm = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <form @submit.prevent="save" class="modal-body">
          <div class="form-group">
            <label>Заголовок</label>
            <input
              v-model="form.title"
              placeholder="Введите заголовок"
              required
            />
          </div>
          <div class="form-group">
            <label>Текст</label>
            <textarea
              v-model="form.content"
              rows="5"
              placeholder="Текст объявления..."
              required
            ></textarea>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.is_important" />
              <span>Важное объявление</span>
            </label>
            <span class="hint-text">
              Важные объявления выделяются и отправляются всем на email
            </span>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showForm = false"
            >
              Отмена
            </button>
            <button type="submit" class="btn btn-primary">Опубликовать</button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmModal
      v-if="showConfirm"
      title="Удалить объявление?"
      :message="toDelete?.title || ''"
      confirm-text="Удалить"
      danger
      @close="showConfirm = false"
      @confirm="confirmDel"
    />
  </div>
</template>

<style lang="scss">
.btn-text {
  @media (max-width: 480px) {
    display: none;
  }
}

.announcements-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.announcement-card {
  &.important {
    border-left: 4px solid var(--danger);
  }

  h3 {
    margin: 0 0 12px;
    font-size: 1.1rem;
  }

  p {
    color: var(--text-secondary);
    margin: 0 0 16px;
    line-height: 1.6;
    white-space: pre-wrap;
  }
}

.ann-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.ann-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ann-date {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  input {
    width: 18px;
    height: 18px;
  }
}

.hint-text {
  display: block;
  margin-top: 6px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}
</style>
