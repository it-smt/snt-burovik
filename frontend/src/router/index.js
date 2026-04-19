// src/router/index.ts
import { useAuthStore } from "@/stores/auth";
import { createRouter, createWebHistory } from "vue-router";
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/login",
            name: "login",
            component: () => import("@/views/LoginView.vue"),
            meta: { guest: true },
        },
        {
            path: "/",
            component: () => import("@/components/layout/AppLayout.vue"),
            meta: { requiresAuth: true },
            children: [
                {
                    path: "",
                    name: "dashboard",
                    component: () => import("@/views/DashboardView.vue"),
                },
                {
                    path: "plots",
                    name: "plots",
                    component: () => import("@/views/PlotsView.vue"),
                },
                {
                    path: "payments",
                    name: "payments",
                    component: () => import("@/views/PaymentsView.vue"),
                },
                {
                    path: "meters",
                    name: "meters",
                    component: () => import("@/views/MetersView.vue"),
                },
                {
                    path: "announcements",
                    name: "announcements",
                    component: () => import("@/views/AnnouncementsView.vue"),
                },
                {
                    path: "appeals",
                    name: "appeals",
                    component: () => import("@/views/AppealsView.vue"),
                },
                {
                    path: "reports",
                    name: "reports",
                    component: () => import("@/views/ReportsView.vue"),
                    meta: { roles: ["chairman", "accountant", "admin"] },
                },
                {
                    path: "settings",
                    name: "settings",
                    component: () => import("@/views/SettingsView.vue"),
                },
                {
                    path: "users",
                    name: "users",
                    component: () => import("@/views/UsersView.vue"),
                    meta: { roles: ["chairman", "admin"] },
                },
                {
                    path: "tariffs",
                    name: "tariffs",
                    component: () => import("@/views/TariffsView.vue"),
                    meta: { roles: ["chairman", "accountant", "admin"] },
                },
            ],
        },
        {
            path: "/:pathMatch(.*)*",
            name: "not-found",
            component: () => import("@/views/NotFoundView.vue"),
        },
    ],
});
router.beforeEach(async (to) => {
    const auth = useAuthStore();
    if (to.meta.requiresAuth) {
        if (!auth.token) {
            return { name: "login", query: { redirect: to.fullPath } };
        }
        if (!auth.user) {
            await auth.fetchUser();
            if (!auth.user) {
                return { name: "login" };
            }
        }
        const allowedRoles = to.meta.roles;
        if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
            return { name: "dashboard" };
        }
    }
    if (to.meta.guest && auth.isAuthenticated) {
        return { name: "dashboard" };
    }
});
export default router;
