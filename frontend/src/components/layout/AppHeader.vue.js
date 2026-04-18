import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import ConfirmModal from "@/components/common/ConfirmModal.vue";
const emit = defineEmits();
const auth = useAuthStore();
const router = useRouter();
const showLogoutConfirm = ref(false);
const roleLabels = {
    owner: "Собственник",
    chairman: "Председатель",
    accountant: "Бухгалтер",
    admin: "Администратор",
};
function confirmLogout() {
    showLogoutConfirm.value = true;
}
function logout() {
    auth.logout();
    showLogoutConfirm.value = false;
    router.push("/login");
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
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "app-header" },
});
/** @type {__VLS_StyleScopedClasses['app-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header-left" },
});
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.emit('toggle-sidebar');
            // @ts-ignore
            [emit,];
        } },
    ...{ class: "menu-toggle" },
});
/** @type {__VLS_StyleScopedClasses['menu-toggle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "pi pi-bars" },
});
/** @type {__VLS_StyleScopedClasses['pi']} */ ;
/** @type {__VLS_StyleScopedClasses['pi-bars']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "header-title" },
});
/** @type {__VLS_StyleScopedClasses['header-title']} */ ;
(__VLS_ctx.auth.sntName);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header-right" },
});
/** @type {__VLS_StyleScopedClasses['header-right']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "user-role-badge" },
});
/** @type {__VLS_StyleScopedClasses['user-role-badge']} */ ;
(__VLS_ctx.roleLabels[__VLS_ctx.auth.userRole ?? ""]);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "user-name-desktop" },
});
/** @type {__VLS_StyleScopedClasses['user-name-desktop']} */ ;
(__VLS_ctx.auth.user?.full_name);
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.confirmLogout) },
    ...{ class: "logout-btn" },
    title: "Выйти",
});
/** @type {__VLS_StyleScopedClasses['logout-btn']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "pi pi-sign-out" },
});
/** @type {__VLS_StyleScopedClasses['pi']} */ ;
/** @type {__VLS_StyleScopedClasses['pi-sign-out']} */ ;
if (__VLS_ctx.showLogoutConfirm) {
    const __VLS_0 = ConfirmModal;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onClose': {} },
        ...{ 'onConfirm': {} },
        title: "Выйти из системы?",
        message: "Вы уверены, что хотите выйти из аккаунта?",
        confirmText: "Выйти",
        danger: true,
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClose': {} },
        ...{ 'onConfirm': {} },
        title: "Выйти из системы?",
        message: "Вы уверены, что хотите выйти из аккаунта?",
        confirmText: "Выйти",
        danger: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = ({ close: {} },
        { onClose: (...[$event]) => {
                if (!(__VLS_ctx.showLogoutConfirm))
                    return;
                __VLS_ctx.showLogoutConfirm = false;
                // @ts-ignore
                [auth, auth, auth, roleLabels, confirmLogout, showLogoutConfirm, showLogoutConfirm,];
            } });
    const __VLS_7 = ({ confirm: {} },
        { onConfirm: (__VLS_ctx.logout) });
    var __VLS_3;
    var __VLS_4;
}
// @ts-ignore
[logout,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
});
export default {};
