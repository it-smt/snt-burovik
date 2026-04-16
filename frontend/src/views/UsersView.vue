<!-- src/views/UsersView.vue -->

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAppToast } from "@/composables/useToast";
import {
  usersApi,
  type CreateUserData,
  type UpdateUserData,
} from "@/api/users";
import type { User, UserRole } from "@/types";
import UserFormModal from "@/components/users/UserFormModal.vue";
import ConfirmModal from "@/components/common/ConfirmModal.vue";
import Pagination from "@/components/common/Pagination.vue";
import Skeleton from "@/components/common/Skeleton.vue";
import UserAvatar from "@/components/common/UserAvatar.vue";

const toast = useAppToast();
const users = ref<User[]>([]);
const loading = ref(true);
const search = ref("");
const roleFilter = ref<UserRole | "">("");

// Пагинация
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const perPage = ref(10);

// Модалки
const showForm = ref(false);
const editingUser = ref<User | null>(null);
const showConfirm = ref(false);
const userToDelete = ref<User | null>(null);
const showPasswordModal = ref(false);
const tempPassword = ref("");
const passwordUser = ref<User | null>(null);

const roles: { value: UserRole | ""; label: string }[] = [
  { value: "", label: "Все роли" },
  { value: "owner", label: "Собственники" },
  { value: "chairman", label: "Председатели" },
  { value: "accountant", label: "Бухгалтеры" },
  { value: "admin", label: "Администраторы" },
];

const roleLabels: Record<UserRole, string> = {
  owner: "Собственник",
  chairman: "Председатель",
  accountant: "Бухгалтер",
  admin: "Администратор",
};

const roleColors: Record<UserRole, string> = {
  owner: "#22c55e",
  chairman: "#6366f1",
  accountant: "#f59e0b",
  admin: "#ef4444",
};

async function loadUsers() {
  loading.value = true;
  try {
    const { data } = await usersApi.getAll({
      search: search.value || undefined,
      role: roleFilter.value || undefined,
      page: currentPage.value,
      per_page: perPage.value,
    });
    users.value = data.items;
    totalPages.value = data.pages;
    totalItems.value = data.total;
  } catch {
    toast.error("Не удалось загрузить пользователей");
  } finally {
    loading.value = false;
  }
}

onMounted(loadUsers);

function openCreateForm() {
  editingUser.value = null;
  showForm.value = true;
}

function openEditForm(user: User) {
  editingUser.value = user;
  showForm.value = true;
}

async function handleSave(data: CreateUserData | UpdateUserData) {
  try {
    if (editingUser.value) {
      await usersApi.update(editingUser.value.id, data as UpdateUserData);
      toast.success("Пользователь обновлён");
    } else {
      await usersApi.create(data as CreateUserData);
      toast.success("Пользователь создан");
    }
    showForm.value = false;
    await loadUsers();
  } catch (e: any) {
    const msg = e.response?.data?.detail || "Не удалось сохранить";
    toast.error(msg);
  }
}

function confirmDelete(user: User) {
  userToDelete.value = user;
  showConfirm.value = true;
}

async function handleDelete() {
  if (!userToDelete.value) return;
  try {
    await usersApi.delete(userToDelete.value.id);
    toast.success(`${userToDelete.value.full_name} удалён`);
    showConfirm.value = false;
    userToDelete.value = null;
    await loadUsers();
  } catch {
    toast.error("Не удалось удалить пользователя");
  }
}

async function resetPassword(user: User) {
  try {
    const { data } = await usersApi.resetPassword(user.id);
    tempPassword.value = data.temp_password;
    passwordUser.value = user;
    showPasswordModal.value = true;
    toast.success("Пароль сброшен");
  } catch {
    toast.error("Не удалось сбросить пароль");
  }
}

async function toggleActive(user: User) {
  try {
    await usersApi.update(user.id, { is_active: !user.is_active });
    toast.success(
      user.is_active
        ? "Пользователь заблокирован"
        : "Пользователь разблокирован",
    );
    await loadUsers();
  } catch {
    toast.error("Не удалось изменить статус");
  }
}

function changePage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  loadUsers();
}

let searchTimeout: number;
function onSearchInput() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    loadUsers();
  }, 300);
}

function onFilterChange() {
  currentPage.value = 1;
  loadUsers();
}

function copyPassword() {
  navigator.clipboard.writeText(tempPassword.value);
  toast.info("Пароль скопирован в буфер обмена");
}
</script>

<template>
  <div class="users-page">
    <!-- Header -->
    <div class="page-header">
      <h2 class="page-title">Пользователи</h2>
      <button class="btn btn-primary" @click="openCreateForm">
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
          placeholder="Поиск..."
          @input="onSearchInput"
        />
      </div>

      <select v-model="roleFilter" class="select" @change="onFilterChange">
        <option v-for="r in roles" :key="r.value" :value="r.value">
          {{ r.label }}
        </option>
      </select>
    </div>

    <!-- Скелетон загрузки -->
    <template v-if="loading">
      <Skeleton type="table" :count="5" />
      <Skeleton type="card" :count="3" />
    </template>

    <template v-else>
      <!-- Десктоп таблица -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Пользователь</th>
              <th>Контакты</th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>
                <div class="user-cell">
                  <UserAvatar :name="user.full_name" :role="user.role" />
                  <span class="user-name">{{ user.full_name }}</span>
                </div>
              </td>
              <td>
                <div class="contacts-cell">
                  <span><i class="pi pi-envelope"></i> {{ user.email }}</span>
                  <span><i class="pi pi-phone"></i> {{ user.phone }}</span>
                </div>
              </td>
              <td>
                <span
                  class="badge"
                  :style="{
                    background: roleColors[user.role] + '20',
                    color: roleColors[user.role],
                  }"
                >
                  {{ roleLabels[user.role] }}
                </span>
              </td>
              <td>
                <span
                  :class="[
                    'badge',
                    user.is_active ? 'badge-success' : 'badge-danger',
                  ]"
                >
                  {{ user.is_active ? "Активен" : "Заблокирован" }}
                </span>
              </td>
              <td>
                <div class="table-actions">
                  <button
                    class="action-btn"
                    title="Редактировать"
                    @click="openEditForm(user)"
                  >
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button
                    class="action-btn"
                    title="Сбросить пароль"
                    @click="resetPassword(user)"
                  >
                    <i class="pi pi-key"></i>
                  </button>
                  <button
                    class="action-btn"
                    :title="user.is_active ? 'Заблокировать' : 'Разблокировать'"
                    @click="toggleActive(user)"
                  >
                    <i
                      :class="user.is_active ? 'pi pi-lock' : 'pi pi-lock-open'"
                    ></i>
                  </button>
                  <button
                    class="action-btn danger"
                    title="Удалить"
                    @click="confirmDelete(user)"
                  >
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="users.length === 0">
              <td colspan="5" class="empty-row">Пользователи не найдены</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Мобильные карточки -->
      <div class="mobile-cards">
        <div v-for="user in users" :key="user.id" class="mobile-card">
          <div class="mobile-card-header">
            <div class="user-cell">
              <UserAvatar :name="user.full_name" :role="user.role" />
              <div>
                <div class="user-name">{{ user.full_name }}</div>
                <span
                  class="badge"
                  :style="{
                    background: roleColors[user.role] + '20',
                    color: roleColors[user.role],
                  }"
                >
                  {{ roleLabels[user.role] }}
                </span>
              </div>
            </div>
            <span
              :class="[
                'badge',
                user.is_active ? 'badge-success' : 'badge-danger',
              ]"
            >
              {{ user.is_active ? "Активен" : "Заблокирован" }}
            </span>
          </div>

          <div class="mobile-card-body">
            <div class="mobile-card-row">
              <span class="label"><i class="pi pi-envelope"></i> Email</span>
              <span class="value">{{ user.email }}</span>
            </div>
            <div class="mobile-card-row">
              <span class="label"><i class="pi pi-phone"></i> Телефон</span>
              <span class="value">{{ user.phone }}</span>
            </div>
          </div>

          <div class="mobile-card-footer">
            <button
              class="btn btn-sm btn-secondary"
              @click="openEditForm(user)"
            >
              <i class="pi pi-pencil"></i> Изменить
            </button>
            <button
              class="btn btn-sm btn-secondary"
              @click="resetPassword(user)"
            >
              <i class="pi pi-key"></i> Пароль
            </button>
            <button class="btn btn-sm btn-danger" @click="confirmDelete(user)">
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>

        <div v-if="users.length === 0" class="empty-state">
          <i class="pi pi-users"></i>
          <p>Пользователи не найдены</p>
          <button
            class="btn btn-primary"
            style="margin-top: 12px"
            @click="openCreateForm"
          >
            <i class="pi pi-plus"></i> Добавить первого
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

    <!-- Модалки -->
    <UserFormModal
      v-if="showForm"
      :user="editingUser"
      @close="showForm = false"
      @save="handleSave"
    />

    <ConfirmModal
      v-if="showConfirm"
      title="Удалить пользователя?"
      :message="`Вы уверены, что хотите удалить ${userToDelete?.full_name}?`"
      confirm-text="Удалить"
      danger
      @close="showConfirm = false"
      @confirm="handleDelete"
    />

    <!-- Модалка с паролем -->
    <div
      v-if="showPasswordModal"
      class="modal-overlay"
      @click.self="showPasswordModal = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h3>Временный пароль</h3>
          <button class="close-btn" @click="showPasswordModal = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>
            Новый пароль для <strong>{{ passwordUser?.full_name }}</strong
            >:
          </p>
          <div class="password-display">
            <code>{{ tempPassword }}</code>
            <button class="btn btn-sm btn-secondary" @click="copyPassword">
              <i class="pi pi-copy"></i>
            </button>
          </div>
          <p class="hint">
            <i class="pi pi-info-circle"></i>
            Сообщите пароль пользователю
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="showPasswordModal = false">
            Готово
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.users-page {
  .btn-text {
    @media (max-width: 480px) {
      display: none;
    }
  }
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-weight: 500;
  color: var(--text-primary);
}

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

.password-display {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;

  code {
    flex: 1;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: 2px;
  }
}

.hint {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.85rem;

  i {
    color: var(--primary);
  }
}
</style>
