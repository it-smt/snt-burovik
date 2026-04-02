<!-- src/components/common/PWAInstallBanner.vue -->

<script setup lang="ts">
import { ref } from "vue";
import { usePWA } from "@/composables/usePWA";

const { canInstall, install } = usePWA();
const dismissed = ref(false);

function dismiss() {
  dismissed.value = true;
  sessionStorage.setItem("pwa-dismissed", "1");
}

// Не показываем, если уже скрыли в этой сессии
if (sessionStorage.getItem("pwa-dismissed")) {
  dismissed.value = true;
}
</script>

<template>
  <Transition name="slide-up">
    <div v-if="canInstall && !dismissed" class="pwa-banner">
      <div class="pwa-banner-content">
        <div class="pwa-banner-icon">
          <i class="pi pi-download"></i>
        </div>
        <div class="pwa-banner-text">
          <strong>Установить приложение</strong>
          <span>Быстрый доступ с рабочего стола</span>
        </div>
      </div>
      <div class="pwa-banner-actions">
        <button class="btn btn-sm btn-secondary" @click="dismiss">Позже</button>
        <button class="btn btn-sm btn-primary" @click="install">
          <i class="pi pi-download"></i> Установить
        </button>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
.pwa-banner {
  position: fixed;
  bottom: 16px;
  left: 16px;
  right: 16px;
  max-width: 480px;
  margin: 0 auto;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.pwa-banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pwa-banner-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.pwa-banner-text {
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-size: 0.95rem;
    color: var(--text-primary);
  }

  span {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }
}

.pwa-banner-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
