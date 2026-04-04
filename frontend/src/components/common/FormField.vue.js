const __VLS_props = defineProps();
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-field" },
    ...{ class: ({ 'has-error': !!__VLS_ctx.error }) },
});
/** @type {__VLS_StyleScopedClasses['form-field']} */ ;
/** @type {__VLS_StyleScopedClasses['has-error']} */ ;
if (__VLS_ctx.label) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "form-field-label" },
    });
    /** @type {__VLS_StyleScopedClasses['form-field-label']} */ ;
    (__VLS_ctx.label);
    if (__VLS_ctx.required) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "required-mark" },
        });
        /** @type {__VLS_StyleScopedClasses['required-mark']} */ ;
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-field-input" },
});
/** @type {__VLS_StyleScopedClasses['form-field-input']} */ ;
var __VLS_0 = {};
let __VLS_2;
/** @ts-ignore @type {typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent1(__VLS_2, new __VLS_2({
    name: "fade",
}));
const __VLS_4 = __VLS_3({
    name: "fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_3));
const { default: __VLS_7 } = __VLS_5.slots;
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "form-field-error" },
    });
    /** @type {__VLS_StyleScopedClasses['form-field-error']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-exclamation-circle" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-exclamation-circle']} */ ;
    (__VLS_ctx.error);
}
// @ts-ignore
[error, error, error, label, label, required,];
var __VLS_5;
if (__VLS_ctx.hint && !__VLS_ctx.error) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "form-field-hint" },
    });
    /** @type {__VLS_StyleScopedClasses['form-field-hint']} */ ;
    (__VLS_ctx.hint);
}
// @ts-ignore
var __VLS_1 = __VLS_0;
// @ts-ignore
[error, hint, hint,];
const __VLS_base = (await import('vue')).defineComponent({
    __typeProps: {},
});
const __VLS_export = {};
export default {};
