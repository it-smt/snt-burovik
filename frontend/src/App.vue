<!-- src/App.vue -->

<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import Toast from "primevue/toast";
import PWAInstallBanner from "@/components/common/PWAInstallBanner.vue";

const auth = useAuthStore();

onMounted(() => {
  if (auth.token) {
    auth.fetchUser();
    auth.fetchOrganization();
  }
});
</script>

<template>
  <Toast position="top-right" />
  <RouterView />
  <PWAInstallBanner />
</template>

<style>
.p-toast {
  z-index: 10000 !important;
  opacity: 1 !important;
}

.p-toast-message {
  border-radius: 10px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
  margin-bottom: 8px !important;
}

.p-toast-message-content {
  padding: 12px 16px !important;
  align-items: center !important;
  gap: 12px !important;
}

.p-toast-summary {
  font-weight: 600 !important;
  font-size: 0.9rem !important;
}

.p-toast-detail {
  font-size: 0.85rem !important;
  margin-top: 2px !important;
}
</style>
