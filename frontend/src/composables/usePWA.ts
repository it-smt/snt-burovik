// src/composables/usePWA.ts

import { onMounted, ref } from "vue";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
const canInstall = ref(false);
const isInstalled = ref(false);
const needsUpdate = ref(false);

// Проверяем — уже установлено?
function checkInstalled() {
  isInstalled.value =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;
}

export function usePWA() {
  onMounted(() => {
    checkInstalled();

    // Перехватываем событие установки
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt.value = e as BeforeInstallPromptEvent;
      canInstall.value = true;
    });

    // Отслеживаем установку
    window.addEventListener("appinstalled", () => {
      canInstall.value = false;
      isInstalled.value = true;
      deferredPrompt.value = null;
    });
  });

  async function install() {
    if (!deferredPrompt.value) return;

    deferredPrompt.value.prompt();
    const { outcome } = await deferredPrompt.value.userChoice;

    if (outcome === "accepted") {
      canInstall.value = false;
      isInstalled.value = true;
    }

    deferredPrompt.value = null;
  }

  return {
    canInstall,
    isInstalled,
    needsUpdate,
    install,
  };
}
