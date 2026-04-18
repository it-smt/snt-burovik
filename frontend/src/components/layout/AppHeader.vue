<!-- src/components/layout/AppHeader.vue -->

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import ConfirmModal from "@/components/common/ConfirmModal.vue";

const emit = defineEmits<{ "toggle-sidebar": [] }>();

const auth = useAuthStore();
const router = useRouter();
const showLogoutConfirm = ref(false);

const roleLabels: Record<string, string> = {
  owner: "Собственник",
  chairman: "Председатель",
  accountant: "Бухгалтер",
  admin: "Администратор",
};

function confirmLogout() {
  showLogoutConfirm.value = true;
}

function logout() {
  auth.logout();
  showLogoutConfirm.value = false;
  router.push("/login");
}
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <button class="menu-toggle" @click="emit('toggle-sidebar')">
        <i class="pi pi-bars"></i>
      </button>
      <span class="header-title">{{ auth.sntName }}</span>
    </div>

    <div class="header-right">
      <span class="user-role-badge">
        {{ roleLabels[auth.userRole ?? ""] }}
      </span>

      <span class="user-name-desktop">
        {{ auth.user?.full_name }}
      </span>

      <button class="logout-btn" @click="confirmLogout" title="Выйти">
        <i class="pi pi-sign-out"></i>
      </button>
    </div>

    <ConfirmModal
      v-if="showLogoutConfirm"
      title="Выйти из системы?"
      message="Вы уверены, что хотите выйти из аккаунта?"
      confirm-text="Выйти"
      danger
      @close="showLogoutConfirm = false"
      @confirm="logout"
    />
  </header>
</template>

<style lang="scss">
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: var(--header-height);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 30;

  @media (min-width: 640px) {
    padding: 0 24px;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #475569;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f1f5f9;
  }
}

.header-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1rem;

  @media (min-width: 1024px) {
    display: none;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-role-badge {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;

  @media (max-width: 480px) {
    display: none;
  }
}

.user-name-desktop {
  font-weight: 500;
  color: #334155;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    display: none;
  }
}

.logout-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #fef2f2;
  }
}
</style>
