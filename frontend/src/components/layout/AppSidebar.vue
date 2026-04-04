<!-- src/components/layout/AppSidebar.vue -->

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { appealsApi } from "@/api/appeals";
import { metersApi } from "@/api/meters";

const props = defineProps<{
  open: boolean;
  isMobile: boolean;
}>();

const emit = defineEmits<{
  close: [];
  navigate: [];
}>();

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

// Бейджи — живые данные из API
const badges = ref({
  appeals: 0,
  meters: 0,
});

let refreshInterval: number | null = null;

async function loadBadges() {
  // Загружаем статистику только для авторизованных пользователей с правами
  if (auth.isChairman || auth.isAdmin) {
    try {
      const stats = await appealsApi.getStats();
      badges.value.appeals = stats.data.new_count;
    } catch (e) {
      console.error("Failed to load appeals stats", e);
    }
  }
  
  if (auth.isAccountant || auth.isChairman || auth.isAdmin) {
    try {
      const stats = await metersApi.getStats();
      badges.value.meters = stats.data.unverified_count;
    } catch (e) {
      console.error("Failed to load meters stats", e);
    }
  }
}

onMounted(() => {
  loadBadges();
  // Обновляем бейджи каждые 30 секунд
  refreshInterval = window.setInterval(loadBadges, 30000);
});

onUnmounted(() => {
  if (refreshInterval) {
    window.clearInterval(refreshInterval);
  }
});

interface MenuItem {
  label: string;
  icon: string;
  to: string;
  roles?: string[];
  badge?: number;
}

const menuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [
    { label: "Главная", icon: "pi pi-home", to: "/" },
    { label: "Участки", icon: "pi pi-map", to: "/plots" },
    {
      label: "Пользователи",
      icon: "pi pi-users",
      to: "/users",
      roles: ["chairman", "admin"],
    },
    { label: "Платежи", icon: "pi pi-wallet", to: "/payments" },
    {
      label: "Тарифы",
      icon: "pi pi-tag",
      to: "/tariffs",
      roles: ["chairman", "accountant", "admin"],
    },
    {
      label: "Счётчики",
      icon: "pi pi-gauge",
      to: "/meters",
      badge: badges.value.meters,
    },
    { label: "Объявления", icon: "pi pi-megaphone", to: "/announcements" },
    {
      label: "Обращения",
      icon: "pi pi-envelope",
      to: "/appeals",
      badge: badges.value.appeals,
    },
    {
      label: "Отчёты",
      icon: "pi pi-chart-bar",
      to: "/reports",
      roles: ["chairman", "accountant", "admin"],
    },
    { label: "Настройки", icon: "pi pi-cog", to: "/settings" },
  ];

  return items.filter((item) => {
    if (!item.roles) return true;
    return auth.userRole && item.roles.includes(auth.userRole);
  });
});

function navigate(to: string) {
  router.push(to);
  emit("navigate");
}

function isActive(to: string) {
  if (to === "/") return route.path === "/";
  return route.path.startsWith(to);
}
</script>

<template>
  <aside class="sidebar" :class="{ open, mobile: isMobile }">
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <i class="pi pi-sun"></i>
        <span class="logo-text">СОНТ «Буровик»</span>
      </div>
      <button v-if="isMobile" class="close-sidebar" @click="emit('close')">
        <i class="pi pi-times"></i>
      </button>
    </div>

    <nav class="sidebar-nav">
      <button
        v-for="item in menuItems"
        :key="item.to"
        class="nav-item"
        :class="{ active: isActive(item.to) }"
        @click="navigate(item.to)"
      >
        <i :class="item.icon"></i>
        <span>{{ item.label }}</span>
        <span v-if="item.badge && item.badge > 0" class="nav-badge">
          {{ item.badge }}
        </span>
      </button>
    </nav>

    <div class="sidebar-footer">
      <div class="user-mini">
        <div class="user-avatar">
          {{ auth.user?.full_name?.charAt(0) || "?" }}
        </div>
        <div class="user-info">
          <span class="user-name">{{ auth.user?.full_name }}</span>
          <span class="user-role">{{ auth.userRole }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<style lang="scss">
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: #1e293b;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  z-index: 50;
  transition: transform 0.3s ease;

  @media (min-width: 1024px) {
    transform: translateX(0);
  }

  @media (max-width: 1023px) {
    transform: translateX(-100%);

    &.open {
      transform: translateX(0);
    }
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #334155;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;

  i {
    font-size: 1.5rem;
    color: #f59e0b;
  }

  .logo-text {
    font-size: 1rem;
    font-weight: 700;
    white-space: nowrap;
  }
}

.close-sidebar {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #94a3b8;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #334155;
    color: #fff;
  }

  @media (min-width: 1024px) {
    display: none;
  }
}

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: none;
  color: #94a3b8;
  font-size: 0.95rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  width: 100%;
  text-align: left;
  position: relative;

  &:hover {
    background: #334155;
    color: #e2e8f0;
  }

  &.active {
    background: var(--primary);
    color: #ffffff;

    .nav-badge {
      background: #fff;
      color: var(--primary);
    }
  }

  i {
    font-size: 1.1rem;
    width: 24px;
    text-align: center;
    flex-shrink: 0;
  }

  span:first-of-type {
    flex: 1;
  }
}

.nav-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #ef4444;
  color: #fff;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #334155;
}

.user-mini {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;

  .user-name {
    font-size: 0.9rem;
    font-weight: 500;
    color: #e2e8f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-role {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: capitalize;
  }
}
</style>
