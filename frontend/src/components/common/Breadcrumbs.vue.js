import { computed } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();
const routeNames = {
    dashboard: "Главная",
    plots: "Участки",
    users: "Пользователи",
    payments: "Платежи",
    tariffs: "Тарифы",
    meters: "Счётчики",
    announcements: "Объявления",
    appeals: "Обращения",
    reports: "Отчёты",
    settings: "Настройки",
};
const breadcrumbs = computed(() => {
    const items = [
        { label: "Главная", to: "/" },
    ];
    const routeName = route.name;
    if (routeName && routeName !== "dashboard" && routeNames[routeName]) {
        items.push({ label: routeNames[routeName] });
    }
    return items;
});
const showBreadcrumbs = computed(() => {
    return route.name !== "dashboard";
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.showBreadcrumbs) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
        ...{ class: "breadcrumbs" },
    });
    /** @type {__VLS_StyleScopedClasses['breadcrumbs']} */ ;
    for (const [item, idx] of __VLS_vFor((__VLS_ctx.breadcrumbs))) {
        (idx);
        if (item.to) {
            let __VLS_0;
            /** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
            RouterLink;
            // @ts-ignore
            const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
                to: (item.to),
                ...{ class: "breadcrumb-link" },
            }));
            const __VLS_2 = __VLS_1({
                to: (item.to),
                ...{ class: "breadcrumb-link" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_1));
            /** @type {__VLS_StyleScopedClasses['breadcrumb-link']} */ ;
            const { default: __VLS_5 } = __VLS_3.slots;
            (item.label);
            // @ts-ignore
            [showBreadcrumbs, breadcrumbs,];
            var __VLS_3;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "breadcrumb-current" },
            });
            /** @type {__VLS_StyleScopedClasses['breadcrumb-current']} */ ;
            (item.label);
        }
        if (idx < __VLS_ctx.breadcrumbs.length - 1) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
                ...{ class: "pi pi-chevron-right breadcrumb-separator" },
            });
            /** @type {__VLS_StyleScopedClasses['pi']} */ ;
            /** @type {__VLS_StyleScopedClasses['pi-chevron-right']} */ ;
            /** @type {__VLS_StyleScopedClasses['breadcrumb-separator']} */ ;
        }
        // @ts-ignore
        [breadcrumbs,];
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
