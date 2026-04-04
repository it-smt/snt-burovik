const props = withDefaults(defineProps(), {
    size: "md",
});
const roleColors = {
    owner: "linear-gradient(135deg, #22c55e, #16a34a)",
    chairman: "linear-gradient(135deg, #6366f1, #4f46e5)",
    accountant: "linear-gradient(135deg, #f59e0b, #d97706)",
    admin: "linear-gradient(135deg, #ef4444, #dc2626)",
};
const defaultGradient = "linear-gradient(135deg, #94a3b8, #64748b)";
const __VLS_defaults = {
    size: "md",
};
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "user-avatar" },
    ...{ class: ([`size-${__VLS_ctx.size}`]) },
    ...{ style: ({ background: __VLS_ctx.role ? __VLS_ctx.roleColors[__VLS_ctx.role] : __VLS_ctx.defaultGradient }) },
});
/** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
(__VLS_ctx.name.charAt(0).toUpperCase());
// @ts-ignore
[size, role, role, roleColors, defaultGradient, name,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
    props: {},
});
export default {};
