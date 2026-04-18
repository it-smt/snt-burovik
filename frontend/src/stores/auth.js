import { authApi } from "@/api/auth";
import { organizationsApi } from "@/api/organizations";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
export const useAuthStore = defineStore("auth", () => {
    const user = ref(null);
    const token = ref(localStorage.getItem("access_token"));
    const loading = ref(false);
    const organization = ref(null);
    const isAuthenticated = computed(() => !!token.value && !!user.value);
    const userRole = computed(() => user.value?.role ?? null);
    const sntName = computed(() => organization.value?.name || "СОНТ «Буровик»");
    const isOwner = computed(() => userRole.value === "owner");
    const isChairman = computed(() => userRole.value === "chairman");
    const isAccountant = computed(() => userRole.value === "accountant");
    const isAdmin = computed(() => userRole.value === "admin");
    const isStaff = computed(() => isChairman.value || isAccountant.value || isAdmin.value);
    async function login(email, password) {
        loading.value = true;
        try {
            const { data } = await authApi.login({ email, password });
            token.value = data.access_token;
            localStorage.setItem("access_token", data.access_token);
            await fetchUser();
            await fetchOrganization();
        }
        finally {
            loading.value = false;
        }
    }
    async function fetchUser() {
        if (!token.value)
            return;
        try {
            const { data } = await authApi.me();
            user.value = data;
        }
        catch {
            logout();
        }
    }
    async function fetchOrganization() {
        if (!token.value)
            return;
        try {
            const { data } = await organizationsApi.get();
            if (data && data.id !== 0) {
                organization.value = data;
            }
        }
        catch (error) {
            console.error("Failed to load organization:", error);
        }
    }
    function updateOrganization(org) {
        organization.value = org;
    }
    function logout() {
        user.value = null;
        token.value = null;
        organization.value = null;
        localStorage.removeItem("access_token");
    }
    return {
        user,
        token,
        organization,
        loading,
        isAuthenticated,
        userRole,
        sntName,
        isOwner,
        isChairman,
        isAccountant,
        isAdmin,
        isStaff,
        login,
        fetchUser,
        fetchOrganization,
        updateOrganization,
        logout,
    };
});
