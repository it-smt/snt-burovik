<!-- src/components/common/Pagination.vue -->

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
}>();

const emit = defineEmits<{
  change: [page: number];
}>();

const visiblePages = computed(() => {
  const pages: number[] = [];
  const total = props.totalPages;
  const current = props.currentPage;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  // Всегда показываем первую
  pages.push(1);

  if (current > 3) {
    pages.push(-1); // ...
  }

  // Страницы вокруг текущей
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push(-1); // ...
  }

  // Всегда показываем последнюю
  pages.push(total);

  return pages;
});
</script>

<template>
  <div class="pagination">
    <div class="pagination-info">
      Показано {{ (currentPage - 1) * 10 + 1 }}–{{
        Math.min(currentPage * 10, totalItems)
      }}
      из {{ totalItems }}
    </div>

    <div class="pagination-controls">
      <button
        class="page-btn"
        :disabled="currentPage <= 1"
        @click="emit('change', currentPage - 1)"
        title="Назад"
      >
        <i class="pi pi-chevron-left"></i>
      </button>

      <template v-for="(page, idx) in visiblePages" :key="idx">
        <span v-if="page === -1" class="page-dots">...</span>
        <button
          v-else
          :class="['page-btn', { active: page === currentPage }]"
          @click="emit('change', page)"
        >
          {{ page }}
        </button>
      </template>

      <button
        class="page-btn"
        :disabled="currentPage >= totalPages"
        @click="emit('change', currentPage + 1)"
        title="Вперёд"
      >
        <i class="pi pi-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<style lang="scss">
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 12px 0;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 640px) {
    flex-direction: column;
  }
}

.pagination-info {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  transition: all 0.2s;

  &:hover:not(:disabled):not(.active) {
    background: #f1f5f9;
    border-color: var(--primary);
    color: var(--primary);
  }

  &.active {
    background: var(--primary);
    border-color: var(--primary);
    color: #fff;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  i {
    font-size: 0.75rem;
  }
}

.page-dots {
  padding: 0 4px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}
</style>
