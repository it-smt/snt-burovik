import { authApi } from "@/api/auth";
import type { User, UserRole } from "@/types";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem("access_token"));
  const loading = ref(false);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const userRole = computed<UserRole | null>(() => user.value?.role ?? null);

  const isOwner = computed(() => userRole.value === "owner");
  const isChairman = computed(() => userRole.value === "chairman");
  const isAccountant = computed(() => userRole.value === "accountant");
  const isAdmin = computed(() => userRole.value === "admin");
  const isStaff = computed(
    () => isChairman.value || isAccountant.value || isAdmin.value,
  );

  async function login(email: string, password: string) {
    loading.value = true;
    try {
      const { data } = await authApi.login({ email, password });
      token.value = data.access_token;
      localStorage.setItem("access_token", data.access_token);
      await fetchUser();
    } finally {
      loading.value = false;
    }
  }

  async function fetchUser() {
    if (!token.value) return;
    try {
      const { data } = await authApi.me();
      user.value = data;
    } catch {
      logout();
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem("access_token");
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    userRole,
    isOwner,
    isChairman,
    isAccountant,
    isAdmin,
    isStaff,
    login,
    fetchUser,
    logout,
  };
});
