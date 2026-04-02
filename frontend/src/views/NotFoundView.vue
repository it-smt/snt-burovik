<!-- src/views/NotFoundView.vue -->

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

function goHome() {
  router.push("/");
}

function goBack() {
  router.back();
}
</script>

<template>
  <div class="not-found-page">
    <div class="not-found-card">
      <div class="not-found-icon">404</div>
      <h1>Страница не найдена</h1>
      <p>К сожалению, запрашиваемая страница не существует или была удалена.</p>
      <div class="not-found-actions">
        <button class="btn btn-secondary" @click="goBack">
          <i class="pi pi-arrow-left"></i> Назад
        </button>
        <button class="btn btn-primary" @click="goHome">
          <i class="pi pi-home"></i> На главную
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-page);
  padding: 20px;
}

.not-found-card {
  text-align: center;
  max-width: 440px;
}

.not-found-icon {
  font-size: 6rem;
  font-weight: 900;
  color: var(--primary);
  opacity: 0.15;
  line-height: 1;
  margin-bottom: 16px;
}

.not-found-card h1 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.not-found-card p {
  color: var(--text-secondary);
  margin: 0 0 32px;
  line-height: 1.5;
}

.not-found-actions {
  display: flex;
  gap: 12px;
  justify-content: center;

  @media (max-width: 400px) {
    flex-direction: column;
  }
}
</style>
