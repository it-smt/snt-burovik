<!-- src/components/common/Breadcrumbs.vue -->

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const routeNames: Record<string, string> = {
  dashboard: "Главная",
  plots: "Участки",
  users: "Пользователи",
  payments: "Платежи",
  tariffs: "Тарифы",
  meters: "Счётчики",
  announcements: "Объявления",
  appeals: "Обращения",
  reports: "Отчёты",
  settings: "Настройки",
};

const breadcrumbs = computed(() => {
  const items: { label: string; to?: string }[] = [
    { label: "Главная", to: "/" },
  ];

  const routeName = route.name as string;

  if (routeName && routeName !== "dashboard" && routeNames[routeName]) {
    items.push({ label: routeNames[routeName] });
  }

  return items;
});

const showBreadcrumbs = computed(() => {
  return route.name !== "dashboard";
});
</script>

<template>
  <nav v-if="showBreadcrumbs" class="breadcrumbs">
    <template v-for="(item, idx) in breadcrumbs" :key="idx">
      <RouterLink v-if="item.to" :to="item.to" class="breadcrumb-link">
        {{ item.label }}
      </RouterLink>
      <span v-else class="breadcrumb-current">{{ item.label }}</span>
      <i
        v-if="idx < breadcrumbs.length - 1"
        class="pi pi-chevron-right breadcrumb-separator"
      ></i>
    </template>
  </nav>
</template>

<style lang="scss">
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 0.85rem;

  @media (max-width: 480px) {
    display: none;
  }
}

.breadcrumb-link {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.15s;

  &:hover {
    color: var(--primary);
  }
}

.breadcrumb-current {
  color: var(--text-primary);
  font-weight: 500;
}

.breadcrumb-separator {
  font-size: 0.65rem;
  color: #cbd5e1;
}
</style>
