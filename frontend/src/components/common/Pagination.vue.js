import { computed } from "vue";
const props = defineProps();
const emit = defineEmits();
const visiblePages = computed(() => {
    const pages = [];
    const total = props.totalPages;
    const current = props.currentPage;
    if (total <= 7) {
        for (let i = 1; i <= total; i++)
            pages.push(i);
        return pages;
    }
    // Всегда показываем первую
    pages.push(1);
    if (current > 3) {
        pages.push(-1); // ...
    }
    // Страницы вокруг текущей
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    if (current < total - 2) {
        pages.push(-1); // ...
    }
    // Всегда показываем последнюю
    pages.push(total);
    return pages;
});
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pagination" },
});
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pagination-info" },
});
/** @type {__VLS_StyleScopedClasses['pagination-info']} */ ;
((__VLS_ctx.currentPage - 1) * 10 + 1);
(Math.min(__VLS_ctx.currentPage * 10, __VLS_ctx.totalItems));
(__VLS_ctx.totalItems);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pagination-controls" },
});
/** @type {__VLS_StyleScopedClasses['pagination-controls']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.emit('change', __VLS_ctx.currentPage - 1);
            // @ts-ignore
            [currentPage, currentPage, currentPage, totalItems, totalItems, emit,];
        } },
    ...{ class: "page-btn" },
    disabled: (__VLS_ctx.currentPage <= 1),
    title: "Назад",
});
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "pi pi-chevron-left" },
});
/** @type {__VLS_StyleScopedClasses['pi']} */ ;
/** @type {__VLS_StyleScopedClasses['pi-chevron-left']} */ ;
for (const [page, idx] of __VLS_vFor((__VLS_ctx.visiblePages))) {
    (idx);
    if (page === -1) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "page-dots" },
        });
        /** @type {__VLS_StyleScopedClasses['page-dots']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(page === -1))
                        return;
                    __VLS_ctx.emit('change', page);
                    // @ts-ignore
                    [currentPage, emit, visiblePages,];
                } },
            ...{ class: (['page-btn', { active: page === __VLS_ctx.currentPage }]) },
        });
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        /** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
        (page);
    }
    // @ts-ignore
    [currentPage,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.emit('change', __VLS_ctx.currentPage + 1);
            // @ts-ignore
            [currentPage, emit,];
        } },
    ...{ class: "page-btn" },
    disabled: (__VLS_ctx.currentPage >= __VLS_ctx.totalPages),
    title: "Вперёд",
});
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "pi pi-chevron-right" },
});
/** @type {__VLS_StyleScopedClasses['pi']} */ ;
/** @type {__VLS_StyleScopedClasses['pi-chevron-right']} */ ;
// @ts-ignore
[currentPage, totalPages,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
