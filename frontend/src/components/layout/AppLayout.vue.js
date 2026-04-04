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
    }
    else {
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
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app-layout" },
    ...{ class: ({ 'sidebar-open': __VLS_ctx.sidebarOpen }) },
});
/** @type {__VLS_StyleScopedClasses['app-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-open']} */ ;
if (__VLS_ctx.isMobile && __VLS_ctx.sidebarOpen) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (__VLS_ctx.closeSidebar) },
        ...{ class: "sidebar-overlay" },
    });
    /** @type {__VLS_StyleScopedClasses['sidebar-overlay']} */ ;
}
const __VLS_0 = AppSidebar;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClose': {} },
    ...{ 'onNavigate': {} },
    open: (__VLS_ctx.sidebarOpen),
    isMobile: (__VLS_ctx.isMobile),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClose': {} },
    ...{ 'onNavigate': {} },
    open: (__VLS_ctx.sidebarOpen),
    isMobile: (__VLS_ctx.isMobile),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ close: {} },
    { onClose: (__VLS_ctx.closeSidebar) });
const __VLS_7 = ({ navigate: {} },
    { onNavigate: (__VLS_ctx.closeSidebar) });
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app-main" },
});
/** @type {__VLS_StyleScopedClasses['app-main']} */ ;
const __VLS_8 = AppHeader;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    ...{ 'onToggleSidebar': {} },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onToggleSidebar': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_13;
const __VLS_14 = ({ toggleSidebar: {} },
    { onToggleSidebar: (__VLS_ctx.toggleSidebar) });
var __VLS_11;
var __VLS_12;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: "app-content" },
});
/** @type {__VLS_StyleScopedClasses['app-content']} */ ;
const __VLS_15 = Breadcrumbs;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({}));
const __VLS_17 = __VLS_16({}, ...__VLS_functionalComponentArgsRest(__VLS_16));
let __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.RouterView | typeof __VLS_components.RouterView} */
RouterView;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
{
    const { default: __VLS_25 } = __VLS_23.slots;
    const [{ Component }] = __VLS_vSlot(__VLS_25);
    let __VLS_26;
    /** @ts-ignore @type {typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
    Transition;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
        name: "page",
        mode: "out-in",
    }));
    const __VLS_28 = __VLS_27({
        name: "page",
        mode: "out-in",
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    const { default: __VLS_31 } = __VLS_29.slots;
    const __VLS_32 = (Component);
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({}));
    const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
    // @ts-ignore
    [sidebarOpen, sidebarOpen, sidebarOpen, isMobile, isMobile, closeSidebar, closeSidebar, closeSidebar, toggleSidebar,];
    var __VLS_29;
    // @ts-ignore
    [];
    __VLS_23.slots['' /* empty slot name completion */];
}
var __VLS_23;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
