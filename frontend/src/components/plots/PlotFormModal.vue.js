import { ref, computed, watch, onMounted } from "vue";
import { useValidation } from "@/composables/useValidation";
import FormField from "@/components/common/FormField.vue";
import { plotsApi, } from "@/api/plots";
const props = defineProps();
const emit = defineEmits();
const isEdit = computed(() => !!props.plot);
const loading = ref(false);
const form = ref({
    number: "",
    area_sqm: 600,
    cadastral_number: "",
    address: "",
    owner_id: null,
    has_electricity: false,
    has_water: false,
});
const owners = ref([]);
const { validate, validateSingle, getError, resetErrors } = useValidation(() => form.value, {
    number: {
        required: true,
        maxLength: 20,
        pattern: /^[А-Яа-яA-Za-z0-9\-]+$/,
        message: "Введите номер (буквы, цифры, дефис)",
    },
    area_sqm: {
        required: true,
        min: 1,
        max: 100000,
        message: "Введите корректную площадь (1–100000 м²)",
    },
    address: {
        required: true,
        minLength: 3,
        maxLength: 200,
        message: "Введите адрес (минимум 3 символа)",
    },
    cadastral_number: {
        pattern: /^(\d{2}:\d{2}:\d{6,7}:\d+)?$/,
        message: "Формат: 50:26:0180505:123",
    },
});
onMounted(async () => {
    const { data } = await plotsApi.getOwnersList();
    owners.value = data;
});
watch(() => props.plot, (plot) => {
    resetErrors();
    if (plot) {
        form.value = {
            number: plot.number,
            area_sqm: plot.area_sqm,
            cadastral_number: plot.cadastral_number || "",
            address: plot.address,
            owner_id: plot.owner_id,
            has_electricity: plot.has_electricity,
            has_water: plot.has_water,
        };
    }
    else {
        form.value = {
            number: "",
            area_sqm: 600,
            cadastral_number: "",
            address: "",
            owner_id: null,
            has_electricity: false,
            has_water: false,
        };
    }
}, { immediate: true });
async function handleSubmit() {
    if (!validate())
        return;
    loading.value = true;
    try {
        const data = {
            number: form.value.number.trim(),
            area_sqm: Number(form.value.area_sqm),
            cadastral_number: form.value.cadastral_number.trim() || undefined,
            address: form.value.address.trim(),
            owner_id: form.value.owner_id,
            has_electricity: form.value.has_electricity,
            has_water: form.value.has_water,
        };
        emit("save", data);
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
    ...{ class: "modal plot-form-modal" },
});
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['plot-form-modal']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "modal-header" },
});
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
(__VLS_ctx.isEdit ? "Редактировать участок" : "Новый участок");
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-row" },
});
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
const __VLS_0 = FormField || FormField;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    label: "Номер участка",
    error: (__VLS_ctx.getError('number')),
    required: true,
}));
const __VLS_2 = __VLS_1({
    label: "Номер участка",
    error: (__VLS_ctx.getError('number')),
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onBlur: (...[$event]) => {
            __VLS_ctx.validateSingle('number');
            // @ts-ignore
            [handleSubmit, getError, validateSingle,];
        } },
    value: (__VLS_ctx.form.number),
    type: "text",
    placeholder: "А-01",
});
// @ts-ignore
[form,];
var __VLS_3;
const __VLS_6 = FormField || FormField;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    label: "Площадь (м²)",
    error: (__VLS_ctx.getError('area_sqm')),
    required: true,
}));
const __VLS_8 = __VLS_7({
    label: "Площадь (м²)",
    error: (__VLS_ctx.getError('area_sqm')),
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onBlur: (...[$event]) => {
            __VLS_ctx.validateSingle('area_sqm');
            // @ts-ignore
            [getError, validateSingle,];
        } },
    type: "number",
    min: "1",
    placeholder: "600",
});
(__VLS_ctx.form.area_sqm);
// @ts-ignore
[form,];
var __VLS_9;
const __VLS_12 = FormField || FormField;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    label: "Адрес / расположение",
    error: (__VLS_ctx.getError('address')),
    required: true,
}));
const __VLS_14 = __VLS_13({
    label: "Адрес / расположение",
    error: (__VLS_ctx.getError('address')),
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const { default: __VLS_17 } = __VLS_15.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onBlur: (...[$event]) => {
            __VLS_ctx.validateSingle('address');
            // @ts-ignore
            [getError, validateSingle,];
        } },
    value: (__VLS_ctx.form.address),
    type: "text",
    placeholder: "Линия А, участок 1",
});
// @ts-ignore
[form,];
var __VLS_15;
const __VLS_18 = FormField || FormField;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    label: "Кадастровый номер",
    error: (__VLS_ctx.getError('cadastral_number')),
    hint: "Формат: 50:26:0180505:123",
}));
const __VLS_20 = __VLS_19({
    label: "Кадастровый номер",
    error: (__VLS_ctx.getError('cadastral_number')),
    hint: "Формат: 50:26:0180505:123",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
const { default: __VLS_23 } = __VLS_21.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onBlur: (...[$event]) => {
            __VLS_ctx.validateSingle('cadastral_number');
            // @ts-ignore
            [getError, validateSingle,];
        } },
    value: (__VLS_ctx.form.cadastral_number),
    type: "text",
    placeholder: "50:26:0180505:123",
});
// @ts-ignore
[form,];
var __VLS_21;
const __VLS_24 = FormField || FormField;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
    label: "Владелец",
}));
const __VLS_26 = __VLS_25({
    label: "Владелец",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
const { default: __VLS_29 } = __VLS_27.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    value: (__VLS_ctx.form.owner_id),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: (null),
});
for (const [owner] of __VLS_vFor((__VLS_ctx.owners))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        key: (owner.id),
        value: (owner.id),
    });
    (owner.full_name);
    // @ts-ignore
    [form, owners,];
}
// @ts-ignore
[];
var __VLS_27;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-field" },
});
/** @type {__VLS_StyleScopedClasses['form-field']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "form-field-label" },
});
/** @type {__VLS_StyleScopedClasses['form-field-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "checkboxes" },
});
/** @type {__VLS_StyleScopedClasses['checkboxes']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "checkbox-label" },
});
/** @type {__VLS_StyleScopedClasses['checkbox-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    type: "checkbox",
});
(__VLS_ctx.form.has_electricity);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "pi pi-bolt" },
});
/** @type {__VLS_StyleScopedClasses['pi']} */ ;
/** @type {__VLS_StyleScopedClasses['pi-bolt']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "checkbox-label" },
});
/** @type {__VLS_StyleScopedClasses['checkbox-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    type: "checkbox",
});
(__VLS_ctx.form.has_water);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "pi pi-box" },
});
/** @type {__VLS_StyleScopedClasses['pi']} */ ;
/** @type {__VLS_StyleScopedClasses['pi-box']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "modal-footer" },
});
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.emit('close');
            // @ts-ignore
            [emit, form, form,];
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
