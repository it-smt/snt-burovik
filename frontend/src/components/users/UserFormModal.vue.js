import { ref, computed, watch } from "vue";
import { useValidation } from "@/composables/useValidation";
import FormField from "@/components/common/FormField.vue";
const props = defineProps();
const emit = defineEmits();
const isEdit = computed(() => !!props.user);
const loading = ref(false);
const form = ref({
    email: "",
    full_name: "",
    phone: "",
    role: "owner",
    password: "",
    password_confirm: "",
});
// Валидация
const { validate, validateSingle, getError, hasError, resetErrors } = useValidation(() => form.value, {
    full_name: {
        required: true,
        minLength: 3,
        maxLength: 100,
        message: "Введите ФИО (минимум 3 символа)",
    },
    email: {
        required: true,
        email: true,
    },
    phone: {
        required: true,
        phone: true,
    },
    password: {
        required: !isEdit.value,
        minLength: 6,
        custom: (val) => {
            if (isEdit.value && !val)
                return null; // При редактировании пароль не обязателен
            if (val && val.length < 6)
                return "Минимум 6 символов";
            return null;
        },
    },
    password_confirm: {
        required: !isEdit.value,
        match: { field: "password", label: "Пароль" },
        custom: (val, all) => {
            if (isEdit.value && !all.password)
                return null;
            if (all.password && val !== all.password)
                return "Пароли не совпадают";
            return null;
        },
    },
});
// Заполняем форму при редактировании
watch(() => props.user, (user) => {
    resetErrors();
    if (user) {
        form.value = {
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            role: user.role,
            password: "",
            password_confirm: "",
        };
    }
    else {
        form.value = {
            email: "",
            full_name: "",
            phone: "",
            role: "owner",
            password: "",
            password_confirm: "",
        };
    }
}, { immediate: true });
const roles = [
    { value: "owner", label: "Собственник" },
    { value: "chairman", label: "Председатель" },
    { value: "accountant", label: "Бухгалтер" },
    { value: "admin", label: "Администратор" },
];
async function handleSubmit() {
    if (!validate())
        return;
    loading.value = true;
    try {
        if (isEdit.value) {
            const data = {
                email: form.value.email,
                full_name: form.value.full_name,
                phone: form.value.phone,
                role: form.value.role,
            };
            emit("save", data);
        }
        else {
            const data = {
                email: form.value.email,
                full_name: form.value.full_name,
                phone: form.value.phone,
                role: form.value.role,
                password: form.value.password,
            };
            emit("save", data);
        }
    }
    finally {
        loading.value = false;
    }
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.emit('close');
            // @ts-ignore
            [emit,];
        } },
    ...{ class: "modal-overlay" },
});
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "modal user-form-modal" },
});
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['user-form-modal']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "modal-header" },
});
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
(__VLS_ctx.isEdit ? "Редактировать" : "Новый пользователь");
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.emit('close');
            // @ts-ignore
            [emit, isEdit,];
        } },
    ...{ class: "close-btn" },
});
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "pi pi-times" },
});
/** @type {__VLS_StyleScopedClasses['pi']} */ ;
/** @type {__VLS_StyleScopedClasses['pi-times']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
    ...{ onSubmit: (__VLS_ctx.handleSubmit) },
    ...{ class: "modal-body" },
});
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
const __VLS_0 = FormField || FormField;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    label: "ФИО",
    error: (__VLS_ctx.getError('full_name')),
    required: true,
}));
const __VLS_2 = __VLS_1({
    label: "ФИО",
    error: (__VLS_ctx.getError('full_name')),
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onBlur: (...[$event]) => {
            __VLS_ctx.validateSingle('full_name');
            // @ts-ignore
            [handleSubmit, getError, validateSingle,];
        } },
    value: (__VLS_ctx.form.full_name),
    type: "text",
    placeholder: "Иванов Иван Иванович",
});
// @ts-ignore
[form,];
var __VLS_3;
const __VLS_6 = FormField || FormField;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    label: "Email",
    error: (__VLS_ctx.getError('email')),
    required: true,
}));
const __VLS_8 = __VLS_7({
    label: "Email",
    error: (__VLS_ctx.getError('email')),
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onBlur: (...[$event]) => {
            __VLS_ctx.validateSingle('email');
            // @ts-ignore
            [getError, validateSingle,];
        } },
    type: "email",
    placeholder: "mail@example.com",
});
(__VLS_ctx.form.email);
// @ts-ignore
[form,];
var __VLS_9;
const __VLS_12 = FormField || FormField;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    label: "Телефон",
    error: (__VLS_ctx.getError('phone')),
    required: true,
}));
const __VLS_14 = __VLS_13({
    label: "Телефон",
    error: (__VLS_ctx.getError('phone')),
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const { default: __VLS_17 } = __VLS_15.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onBlur: (...[$event]) => {
            __VLS_ctx.validateSingle('phone');
            // @ts-ignore
            [getError, validateSingle,];
        } },
    type: "tel",
    placeholder: "+7 900 123-45-67",
});
(__VLS_ctx.form.phone);
// @ts-ignore
[form,];
var __VLS_15;
const __VLS_18 = FormField || FormField;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    label: "Роль",
    required: true,
}));
const __VLS_20 = __VLS_19({
    label: "Роль",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
const { default: __VLS_23 } = __VLS_21.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    value: (__VLS_ctx.form.role),
});
for (const [r] of __VLS_vFor((__VLS_ctx.roles))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        key: (r.value),
        value: (r.value),
    });
    (r.label);
    // @ts-ignore
    [form, roles,];
}
// @ts-ignore
[];
var __VLS_21;
if (!__VLS_ctx.isEdit) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-divider" },
    });
    /** @type {__VLS_StyleScopedClasses['form-divider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    const __VLS_24 = FormField || FormField;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
        label: "Пароль",
        error: (__VLS_ctx.getError('password')),
        required: true,
        hint: "Минимум 6 символов",
    }));
    const __VLS_26 = __VLS_25({
        label: "Пароль",
        error: (__VLS_ctx.getError('password')),
        required: true,
        hint: "Минимум 6 символов",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    const { default: __VLS_29 } = __VLS_27.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onBlur: (...[$event]) => {
                if (!(!__VLS_ctx.isEdit))
                    return;
                __VLS_ctx.validateSingle('password');
                // @ts-ignore
                [isEdit, getError, validateSingle,];
            } },
        type: "password",
        placeholder: "Введите пароль",
    });
    (__VLS_ctx.form.password);
    // @ts-ignore
    [form,];
    var __VLS_27;
    const __VLS_30 = FormField || FormField;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        label: "Подтверждение пароля",
        error: (__VLS_ctx.getError('password_confirm')),
        required: true,
    }));
    const __VLS_32 = __VLS_31({
        label: "Подтверждение пароля",
        error: (__VLS_ctx.getError('password_confirm')),
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    const { default: __VLS_35 } = __VLS_33.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onBlur: (...[$event]) => {
                if (!(!__VLS_ctx.isEdit))
                    return;
                __VLS_ctx.validateSingle('password_confirm');
                // @ts-ignore
                [getError, validateSingle,];
            } },
        type: "password",
        placeholder: "Повторите пароль",
    });
    (__VLS_ctx.form.password_confirm);
    // @ts-ignore
    [form,];
    var __VLS_33;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "modal-footer" },
});
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.emit('close');
            // @ts-ignore
            [emit,];
        } },
    type: "button",
    ...{ class: "btn btn-secondary" },
});
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    type: "submit",
    ...{ class: "btn btn-primary" },
    disabled: (__VLS_ctx.loading),
});
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-spinner pi-spin" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-spinner']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-spin']} */ ;
}
(__VLS_ctx.isEdit ? "Сохранить" : "Создать");
// @ts-ignore
[isEdit, loading, loading,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
