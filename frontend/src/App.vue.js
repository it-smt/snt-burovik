import { onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import Toast from "primevue/toast";
import PWAInstallBanner from "@/components/common/PWAInstallBanner.vue";
const auth = useAuthStore();
onMounted(() => {
    if (auth.token) {
        auth.fetchUser();
    }
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Toast} */
Toast;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    position: "top-right",
}));
const __VLS_2 = __VLS_1({
    position: "top-right",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
/** @ts-ignore @type {typeof __VLS_components.RouterView} */
RouterView;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({}));
const __VLS_7 = __VLS_6({}, ...__VLS_functionalComponentArgsRest(__VLS_6));
const __VLS_10 = PWAInstallBanner;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({}));
const __VLS_12 = __VLS_11({}, ...__VLS_functionalComponentArgsRest(__VLS_11));
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
