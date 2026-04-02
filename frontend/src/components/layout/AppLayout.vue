<!-- src/components/layout/AppLayout.vue -->

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import AppHeader from "./AppHeader.vue";
import AppSidebar from "./AppSidebar.vue";
import Breadcrumbs from "@/components/common/Breadcrumbs.vue";

const sidebarOpen = ref(false);
const isMobile = ref(false);

function checkMobile() {
  isMobile.value = window.innerWidth < 1024;
  if (!isMobile.value) {
    sidebarOpen.value = true;
  } else {
    sidebarOpen.value = false;
  }
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

function closeSidebar() {
  if (isMobile.value) {
    sidebarOpen.value = false;
  }
}

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});
</script>

<template>
  <div class="app-layout" :class="{ 'sidebar-open': sidebarOpen }">
    <div
      v-if="isMobile && sidebarOpen"
      class="sidebar-overlay"
      @click="closeSidebar"
    ></div>

    <AppSidebar
      :open="sidebarOpen"
      :is-mobile="isMobile"
      @close="closeSidebar"
      @navigate="closeSidebar"
    />

    <div class="app-main">
      <AppHeader @toggle-sidebar="toggleSidebar" />
      <main class="app-content">
        <Breadcrumbs />
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style lang="scss">
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-page);
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;

  @media (min-width: 1024px) {
    margin-left: var(--sidebar-width);
  }
}

.app-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;

  @media (max-width: 640px) {
    padding: 16px;
  }
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;

  @media (min-width: 1024px) {
    display: none;
  }
}

// Page transitions
.page-enter-active {
  transition: all 0.2s ease-out;
}

.page-leave-active {
  transition: all 0.15s ease-in;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
