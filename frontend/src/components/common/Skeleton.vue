<!-- src/components/common/Skeleton.vue -->

<script setup lang="ts">
defineProps<{
  type?: "card" | "table" | "text" | "stat";
  count?: number;
}>();
</script>

<template>
  <!-- Карточки -->
  <div v-if="type === 'card'" class="skeleton-cards">
    <div v-for="i in count || 3" :key="i" class="skeleton-card">
      <div class="skeleton-card-header">
        <div class="skeleton-line w-40"></div>
        <div class="skeleton-line w-20"></div>
      </div>
      <div class="skeleton-card-body">
        <div class="skeleton-row">
          <div class="skeleton-line w-30"></div>
          <div class="skeleton-line w-25"></div>
        </div>
        <div class="skeleton-row">
          <div class="skeleton-line w-25"></div>
          <div class="skeleton-line w-35"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Статистика -->
  <div v-else-if="type === 'stat'" class="skeleton-stats">
    <div v-for="i in count || 4" :key="i" class="skeleton-stat">
      <div class="skeleton-circle"></div>
      <div>
        <div
          class="skeleton-line w-20"
          style="height: 24px; margin-bottom: 6px"
        ></div>
        <div class="skeleton-line w-30"></div>
      </div>
    </div>
  </div>

  <!-- Таблица -->
  <div v-else-if="type === 'table'" class="skeleton-table">
    <div class="skeleton-table-header">
      <div class="skeleton-line w-15"></div>
      <div class="skeleton-line w-20"></div>
      <div class="skeleton-line w-15"></div>
      <div class="skeleton-line w-10"></div>
    </div>
    <div v-for="i in count || 5" :key="i" class="skeleton-table-row">
      <div class="skeleton-line w-15"></div>
      <div class="skeleton-line w-25"></div>
      <div class="skeleton-line w-15"></div>
      <div class="skeleton-line w-10"></div>
    </div>
  </div>

  <!-- Текст -->
  <div v-else class="skeleton-text">
    <div
      v-for="i in count || 3"
      :key="i"
      class="skeleton-line"
      :class="'w-' + (80 - i * 15)"
    ></div>
  </div>
</template>

<style lang="scss">
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-line {
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;

  &.w-10 {
    width: 10%;
  }
  &.w-15 {
    width: 15%;
  }
  &.w-20 {
    width: 20%;
  }
  &.w-25 {
    width: 25%;
  }
  &.w-30 {
    width: 30%;
  }
  &.w-35 {
    width: 35%;
  }
  &.w-40 {
    width: 40%;
  }
  &.w-50 {
    width: 50%;
  }
  &.w-60 {
    width: 60%;
  }
  &.w-65 {
    width: 65%;
  }
  &.w-80 {
    width: 80%;
  }
}

.skeleton-circle {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  flex-shrink: 0;
}

// Cards
.skeleton-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
}

.skeleton-card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.skeleton-card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-row {
  display: flex;
  justify-content: space-between;
}

// Stats
.skeleton-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.skeleton-stat {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

// Table
.skeleton-table {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;

  @media (max-width: 768px) {
    display: none;
  }
}

.skeleton-table-header {
  display: flex;
  gap: 24px;
  padding: 14px 16px;
  background: #f8fafc;
  border-bottom: 1px solid var(--border);
}

.skeleton-table-row {
  display: flex;
  gap: 24px;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
}
</style>
