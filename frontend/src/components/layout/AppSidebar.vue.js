import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { appealsApi } from "@/api/appeals";
import { metersApi } from "@/api/meters";
const props = defineProps();
const emit = defineEmits();
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
// Бейджи — живые данные из API
const badges = ref({
    appeals: 0,
    meters: 0,
});
let refreshInterval = null;
async function loadBadges() {
    // Загружаем статистику только для авторизованных пользователей с правами
    if (auth.isChairman || auth.isAdmin) {
        try {
            const stats = await appealsApi.getStats();
            badges.value.appeals = stats.data.new_count;
        }
        catch (e) {
            console.error("Failed to load appeals stats", e);
        }
    }
    if (auth.isAccountant || auth.isChairman || auth.isAdmin) {
        try {
            const stats = await metersApi.getStats();
            badges.value.meters = stats.data.unverified_count;
        }
        catch (e) {
            console.error("Failed to load meters stats", e);
        }
    }
}
onMounted(() => {
    loadBadges();
    // Обновляем бейджи каждые 30 секунд
    refreshInterval = window.setInterval(loadBadges, 30000);
});
onUnmounted(() => {
    if (refreshInterval) {
        window.clearInterval(refreshInterval);
    }
});
const menuItems = computed(() => {
    const items = [
        { label: "Главная", icon: "pi pi-home", to: "/" },
        { label: "Участки", icon: "pi pi-map", to: "/plots" },
        {
            label: "Пользователи",
            icon: "pi pi-users",
            to: "/users",
            roles: ["chairman", "admin"],
        },
        { label: "Платежи", icon: "pi pi-wallet", to: "/payments" },
        {
            label: "Тарифы",
            icon: "pi pi-tag",
            to: "/tariffs",
            roles: ["chairman", "accountant", "admin"],
        },
        {
            label: "Счётчики",
            icon: "pi pi-gauge",
            to: "/meters",
            badge: badges.value.meters,
        },
        { label: "Объявления", icon: "pi pi-megaphone", to: "/announcements" },
        {
            label: "Обращения",
            icon: "pi pi-envelope",
            to: "/appeals",
            badge: badges.value.appeals,
        },
        {
            label: "Отчёты",
            icon: "pi pi-chart-bar",
            to: "/reports",
            roles: ["chairman", "accountant", "admin"],
        },
        { label: "Настройки", icon: "pi pi-cog", to: "/settings" },
    ];
    return items.filter((item) => {
        if (!item.roles)
            return true;
        return auth.userRole && item.roles.includes(auth.userRole);
    });
});
function navigate(to) {
    router.push(to);
    emit("navigate");
}
function isActive(to) {
    if (to === "/")
        return route.path === "/";
    return route.path.startsWith(to);
}
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
    ...{ class: "sidebar" },
    ...{ class: ({ open: __VLS_ctx.open, mobile: __VLS_ctx.isMobile }) },
});
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['open']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "sidebar-header" },
});
/** @type {__VLS_StyleScopedClasses['sidebar-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "sidebar-logo" },
});
/** @type {__VLS_StyleScopedClasses['sidebar-logo']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "pi pi-sun" },
});
/** @type {__VLS_StyleScopedClasses['pi']} */ ;
/** @type {__VLS_StyleScopedClasses['pi-sun']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "logo-text" },
});
/** @type {__VLS_StyleScopedClasses['logo-text']} */ ;
(__VLS_ctx.auth.sntName);
if (__VLS_ctx.isMobile) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isMobile))
                    return;
                __VLS_ctx.emit('close');
                // @ts-ignore
                [open, isMobile, isMobile, auth, emit,];
            } },
        ...{ class: "close-sidebar" },
    });
    /** @type {__VLS_StyleScopedClasses['close-sidebar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-times" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-times']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "sidebar-nav" },
});
/** @type {__VLS_StyleScopedClasses['sidebar-nav']} */ ;
for (const [item] of __VLS_vFor((__VLS_ctx.menuItems))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.navigate(item.to);
                // @ts-ignore
                [menuItems, navigate,];
            } },
        key: (item.to),
        ...{ class: "nav-item" },
        ...{ class: ({ active: __VLS_ctx.isActive(item.to) }) },
    });
    /** @type {__VLS_StyleScopedClasses['nav-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: (item.icon) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (item.label);
    if (item.badge && item.badge > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "nav-badge" },
        });
        /** @type {__VLS_StyleScopedClasses['nav-badge']} */ ;
        (item.badge);
    }
    // @ts-ignore
    [isActive,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "sidebar-footer" },
});
/** @type {__VLS_StyleScopedClasses['sidebar-footer']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "user-mini" },
});
/** @type {__VLS_StyleScopedClasses['user-mini']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "user-avatar" },
});
/** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
(__VLS_ctx.auth.user?.full_name?.charAt(0) || "?");
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "user-info" },
});
/** @type {__VLS_StyleScopedClasses['user-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "user-name" },
});
/** @type {__VLS_StyleScopedClasses['user-name']} */ ;
(__VLS_ctx.auth.user?.full_name);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "user-role" },
});
/** @type {__VLS_StyleScopedClasses['user-role']} */ ;
(__VLS_ctx.auth.userRole);
// @ts-ignore
[auth, auth, auth,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
