import { useAuthStore } from "@/stores/auth";
import OwnerDashboard from "@/components/dashboard/OwnerDashboard.vue";
import ChairmanDashboard from "@/components/dashboard/ChairmanDashboard.vue";
import AccountantDashboard from "@/components/dashboard/AccountantDashboard.vue";
const auth = useAuthStore();
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "page-title" },
});
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
(__VLS_ctx.auth.user?.full_name);
if (__VLS_ctx.auth.isOwner) {
    const __VLS_0 = OwnerDashboard;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
else if (__VLS_ctx.auth.isChairman || __VLS_ctx.auth.isAdmin) {
    const __VLS_5 = ChairmanDashboard;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({}));
    const __VLS_7 = __VLS_6({}, ...__VLS_functionalComponentArgsRest(__VLS_6));
}
else if (__VLS_ctx.auth.isAccountant) {
    const __VLS_10 = AccountantDashboard;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({}));
    const __VLS_12 = __VLS_11({}, ...__VLS_functionalComponentArgsRest(__VLS_11));
}
// @ts-ignore
[auth, auth, auth, auth, auth,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
