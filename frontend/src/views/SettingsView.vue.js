import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useAppToast } from "@/composables/useToast";
import { useValidation } from "@/composables/useValidation";
import FormField from "@/components/common/FormField.vue";
const auth = useAuthStore();
const toast = useAppToast();
const tab = ref("profile");
// ========== ПРОФИЛЬ ==========
const profileForm = ref({
    full_name: "",
    email: "",
    phone: "",
});
const profileValidation = useValidation(() => profileForm.value, {
    full_name: { required: true, minLength: 3, message: "Минимум 3 символа" },
    email: { required: true, email: true },
    phone: { required: true, phone: true },
});
const profileLoading = ref(false);
// ========== СМЕНА ПАРОЛЯ ==========
const passwordForm = ref({
    current_password: "",
    new_password: "",
    confirm_password: "",
});
const passwordValidation = useValidation(() => passwordForm.value, {
    current_password: { required: true, message: "Введите текущий пароль" },
    new_password: { required: true, minLength: 6 },
    confirm_password: {
        required: true,
        match: { field: "new_password", label: "Новый пароль" },
    },
});
const passwordLoading = ref(false);
// ========== ДАННЫЕ СНТ ==========
const sntForm = ref({
    name: "",
    address: "",
    contact_phone: "",
    contact_email: "",
});
const sntValidation = useValidation(() => sntForm.value, {
    name: { required: true, minLength: 3 },
    address: { required: true, minLength: 5 },
    contact_email: { email: true },
    contact_phone: { phone: true },
});
const sntLoading = ref(false);
// ========== УВЕДОМЛЕНИЯ ==========
const notificationsForm = ref({
    email_enabled: true,
    notify_new_appeals: true,
    notify_meter_readings: true,
    notify_debt_reminder: true,
    debt_reminder_day: 1,
    meter_deadline_day: 25,
});
const notificationsLoading = ref(false);
// ========== INIT ==========
onMounted(async () => {
    if (auth.user) {
        profileForm.value = {
            full_name: auth.user.full_name,
            email: auth.user.email,
            phone: auth.user.phone,
        };
    }
    // Загрузка данных СНТ
    if (auth.isChairman || auth.isAdmin) {
        await loadSntData();
    }
});
async function loadSntData() {
    try {
        const { organizationsApi } = await import("@/api/organizations");
        const response = await organizationsApi.get();
        console.log("Loaded organization:", response.data);
        if (response.data && response.data.id !== 0) {
            sntForm.value = {
                name: response.data.name || "",
                address: response.data.address || "",
                contact_phone: response.data.contact_phone || "",
                contact_email: response.data.contact_email || "",
            };
        }
    }
    catch (error) {
        console.error("Failed to load SNT data:", error);
        // Не показываем ошибку, если организация просто не создана
        if (error.response?.status !== 404) {
            toast.error("Не удалось загрузить данные СНТ");
        }
    }
}
// ========== ACTIONS ==========
async function saveProfile() {
    if (!profileValidation.validate())
        return;
    profileLoading.value = true;
    try {
        const { usersApi } = await import("@/api/users");
        const response = await usersApi.updateMe({
            full_name: profileForm.value.full_name,
            email: profileForm.value.email,
            phone: profileForm.value.phone,
        });
        // Обновляем данные в store
        if (auth.user) {
            auth.user.full_name = response.data.full_name;
            auth.user.email = response.data.email;
            auth.user.phone = response.data.phone;
        }
        toast.success("Профиль обновлён");
    }
    catch (error) {
        console.error("Profile update error:", error);
        const message = error.response?.data?.detail || "Не удалось сохранить профиль";
        toast.error(message);
    }
    finally {
        profileLoading.value = false;
    }
}
async function changePassword() {
    if (!passwordValidation.validate())
        return;
    passwordLoading.value = true;
    try {
        const { usersApi } = await import("@/api/users");
        await usersApi.changePassword({
            current_password: passwordForm.value.current_password,
            new_password: passwordForm.value.new_password,
        });
        passwordForm.value = {
            current_password: "",
            new_password: "",
            confirm_password: "",
        };
        passwordValidation.resetErrors();
        toast.success("Пароль изменён");
    }
    catch (error) {
        const message = error.response?.data?.detail || "Не удалось изменить пароль";
        toast.error(message);
    }
    finally {
        passwordLoading.value = false;
    }
}
async function saveSnt() {
    if (!sntValidation.validate())
        return;
    sntLoading.value = true;
    try {
        const { organizationsApi } = await import("@/api/organizations");
        console.log("Saving SNT data:", sntForm.value);
        const response = await organizationsApi.update({
            name: sntForm.value.name,
            address: sntForm.value.address,
            contact_phone: sntForm.value.contact_phone || undefined,
            contact_email: sntForm.value.contact_email || undefined,
        });
        console.log("Saved organization:", response.data);
        // Обновляем данные организации в store
        auth.updateOrganization(response.data);
        toast.success("Данные СНТ сохранены");
    }
    catch (error) {
        console.error("SNT save error:", error);
        const message = error.response?.data?.detail || error.message || "Не удалось сохранить данные СНТ";
        toast.error(message);
    }
    finally {
        sntLoading.value = false;
    }
}
async function saveNotifications() {
    notificationsLoading.value = true;
    try {
        await new Promise((r) => setTimeout(r, 500));
        toast.success("Настройки уведомлений сохранены");
    }
    catch {
        toast.error("Не удалось сохранить настройки");
    }
    finally {
        notificationsLoading.value = false;
    }
}
const roleLabels = {
    owner: "Собственник",
    chairman: "Председатель",
    accountant: "Бухгалтер",
    admin: "Администратор",
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "settings-page" },
});
/** @type {__VLS_StyleScopedClasses['settings-page']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "page-title" },
});
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tabs" },
});
/** @type {__VLS_StyleScopedClasses['tabs']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.tab = 'profile';
            // @ts-ignore
            [tab,];
        } },
    ...{ class: (['tab', { active: __VLS_ctx.tab === 'profile' }]) },
});
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['tab']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "pi pi-user" },
});
/** @type {__VLS_StyleScopedClasses['pi']} */ ;
/** @type {__VLS_StyleScopedClasses['pi-user']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
if (__VLS_ctx.auth.isChairman || __VLS_ctx.auth.isAdmin) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.auth.isChairman || __VLS_ctx.auth.isAdmin))
                    return;
                __VLS_ctx.tab = 'snt';
                // @ts-ignore
                [tab, tab, auth, auth,];
            } },
        ...{ class: (['tab', { active: __VLS_ctx.tab === 'snt' }]) },
    });
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    /** @type {__VLS_StyleScopedClasses['tab']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-building" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-building']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
if (__VLS_ctx.auth.isChairman || __VLS_ctx.auth.isAdmin) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.auth.isChairman || __VLS_ctx.auth.isAdmin))
                    return;
                __VLS_ctx.tab = 'notifications';
                // @ts-ignore
                [tab, tab, auth, auth,];
            } },
        ...{ class: (['tab', { active: __VLS_ctx.tab === 'notifications' }]) },
    });
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    /** @type {__VLS_StyleScopedClasses['tab']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-bell" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-bell']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
if (__VLS_ctx.tab === 'profile') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-section" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-card card" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-card-header" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-card-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-user" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-user']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (__VLS_ctx.saveProfile) },
        ...{ class: "settings-form" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-form']} */ ;
    const __VLS_0 = FormField || FormField;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        label: "ФИО",
        error: (__VLS_ctx.profileValidation.getError('full_name')),
        required: true,
    }));
    const __VLS_2 = __VLS_1({
        label: "ФИО",
        error: (__VLS_ctx.profileValidation.getError('full_name')),
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const { default: __VLS_5 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onBlur: (...[$event]) => {
                if (!(__VLS_ctx.tab === 'profile'))
                    return;
                __VLS_ctx.profileValidation.validateSingle('full_name');
                // @ts-ignore
                [tab, tab, saveProfile, profileValidation, profileValidation,];
            } },
        value: (__VLS_ctx.profileForm.full_name),
        type: "text",
    });
    // @ts-ignore
    [profileForm,];
    var __VLS_3;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-row" },
    });
    /** @type {__VLS_StyleScopedClasses['form-row']} */ ;
    const __VLS_6 = FormField || FormField;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        label: "Email",
        error: (__VLS_ctx.profileValidation.getError('email')),
        required: true,
    }));
    const __VLS_8 = __VLS_7({
        label: "Email",
        error: (__VLS_ctx.profileValidation.getError('email')),
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    const { default: __VLS_11 } = __VLS_9.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onBlur: (...[$event]) => {
                if (!(__VLS_ctx.tab === 'profile'))
                    return;
                __VLS_ctx.profileValidation.validateSingle('email');
                // @ts-ignore
                [profileValidation, profileValidation,];
            } },
        type: "email",
    });
    (__VLS_ctx.profileForm.email);
    // @ts-ignore
    [profileForm,];
    var __VLS_9;
    const __VLS_12 = FormField || FormField;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
        label: "Телефон",
        error: (__VLS_ctx.profileValidation.getError('phone')),
        required: true,
    }));
    const __VLS_14 = __VLS_13({
        label: "Телефон",
        error: (__VLS_ctx.profileValidation.getError('phone')),
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    const { default: __VLS_17 } = __VLS_15.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onBlur: (...[$event]) => {
                if (!(__VLS_ctx.tab === 'profile'))
                    return;
                __VLS_ctx.profileValidation.validateSingle('phone');
                // @ts-ignore
                [profileValidation, profileValidation,];
            } },
        type: "tel",
    });
    (__VLS_ctx.profileForm.phone);
    // @ts-ignore
    [profileForm,];
    var __VLS_15;
    const __VLS_18 = FormField || FormField;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        label: "Роль",
    }));
    const __VLS_20 = __VLS_19({
        label: "Роль",
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    const { default: __VLS_23 } = __VLS_21.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.roleLabels[__VLS_ctx.auth.userRole ?? ''] || '—'),
        type: "text",
        disabled: true,
        ...{ class: "input-disabled" },
    });
    /** @type {__VLS_StyleScopedClasses['input-disabled']} */ ;
    // @ts-ignore
    [auth, roleLabels,];
    var __VLS_21;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        type: "submit",
        ...{ class: "btn btn-primary" },
        disabled: (__VLS_ctx.profileLoading),
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: (__VLS_ctx.profileLoading ? 'pi pi-spinner pi-spin' : 'pi pi-save') },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-card card" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-card-header" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-card-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-lock" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-lock']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (__VLS_ctx.changePassword) },
        ...{ class: "settings-form" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-form']} */ ;
    const __VLS_24 = FormField || FormField;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
        label: "Текущий пароль",
        error: (__VLS_ctx.passwordValidation.getError('current_password')),
        required: true,
    }));
    const __VLS_26 = __VLS_25({
        label: "Текущий пароль",
        error: (__VLS_ctx.passwordValidation.getError('current_password')),
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    const { default: __VLS_29 } = __VLS_27.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onBlur: (...[$event]) => {
                if (!(__VLS_ctx.tab === 'profile'))
                    return;
                __VLS_ctx.passwordValidation.validateSingle('current_password');
                // @ts-ignore
                [profileLoading, profileLoading, changePassword, passwordValidation, passwordValidation,];
            } },
        type: "password",
        placeholder: "Введите текущий пароль",
    });
    (__VLS_ctx.passwordForm.current_password);
    // @ts-ignore
    [passwordForm,];
    var __VLS_27;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-row" },
    });
    /** @type {__VLS_StyleScopedClasses['form-row']} */ ;
    const __VLS_30 = FormField || FormField;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        label: "Новый пароль",
        error: (__VLS_ctx.passwordValidation.getError('new_password')),
        required: true,
        hint: "Минимум 6 символов",
    }));
    const __VLS_32 = __VLS_31({
        label: "Новый пароль",
        error: (__VLS_ctx.passwordValidation.getError('new_password')),
        required: true,
        hint: "Минимум 6 символов",
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    const { default: __VLS_35 } = __VLS_33.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onBlur: (...[$event]) => {
                if (!(__VLS_ctx.tab === 'profile'))
                    return;
                __VLS_ctx.passwordValidation.validateSingle('new_password');
                // @ts-ignore
                [passwordValidation, passwordValidation,];
            } },
        type: "password",
        placeholder: "Новый пароль",
    });
    (__VLS_ctx.passwordForm.new_password);
    // @ts-ignore
    [passwordForm,];
    var __VLS_33;
    const __VLS_36 = FormField || FormField;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
        label: "Подтверждение",
        error: (__VLS_ctx.passwordValidation.getError('confirm_password')),
        required: true,
    }));
    const __VLS_38 = __VLS_37({
        label: "Подтверждение",
        error: (__VLS_ctx.passwordValidation.getError('confirm_password')),
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    const { default: __VLS_41 } = __VLS_39.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onBlur: (...[$event]) => {
                if (!(__VLS_ctx.tab === 'profile'))
                    return;
                __VLS_ctx.passwordValidation.validateSingle('confirm_password');
                // @ts-ignore
                [passwordValidation, passwordValidation,];
            } },
        type: "password",
        placeholder: "Повторите пароль",
    });
    (__VLS_ctx.passwordForm.confirm_password);
    // @ts-ignore
    [passwordForm,];
    var __VLS_39;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        type: "submit",
        ...{ class: "btn btn-primary" },
        disabled: (__VLS_ctx.passwordLoading),
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: (__VLS_ctx.passwordLoading ? 'pi pi-spinner pi-spin' : 'pi pi-key') },
    });
}
if (__VLS_ctx.tab === 'snt') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-section" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-card card" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-card-header" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-card-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-building" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-building']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (__VLS_ctx.saveSnt) },
        ...{ class: "settings-form" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-form']} */ ;
    const __VLS_42 = FormField || FormField;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
        label: "Название",
        error: (__VLS_ctx.sntValidation.getError('name')),
        required: true,
    }));
    const __VLS_44 = __VLS_43({
        label: "Название",
        error: (__VLS_ctx.sntValidation.getError('name')),
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    const { default: __VLS_47 } = __VLS_45.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onBlur: (...[$event]) => {
                if (!(__VLS_ctx.tab === 'snt'))
                    return;
                __VLS_ctx.sntValidation.validateSingle('name');
                // @ts-ignore
                [tab, passwordLoading, passwordLoading, saveSnt, sntValidation, sntValidation,];
            } },
        value: (__VLS_ctx.sntForm.name),
        type: "text",
    });
    // @ts-ignore
    [sntForm,];
    var __VLS_45;
    const __VLS_48 = FormField || FormField;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
        label: "Адрес",
        error: (__VLS_ctx.sntValidation.getError('address')),
        required: true,
    }));
    const __VLS_50 = __VLS_49({
        label: "Адрес",
        error: (__VLS_ctx.sntValidation.getError('address')),
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    const { default: __VLS_53 } = __VLS_51.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onBlur: (...[$event]) => {
                if (!(__VLS_ctx.tab === 'snt'))
                    return;
                __VLS_ctx.sntValidation.validateSingle('address');
                // @ts-ignore
                [sntValidation, sntValidation,];
            } },
        value: (__VLS_ctx.sntForm.address),
        type: "text",
    });
    // @ts-ignore
    [sntForm,];
    var __VLS_51;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-row" },
    });
    /** @type {__VLS_StyleScopedClasses['form-row']} */ ;
    const __VLS_54 = FormField || FormField;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
        label: "Контактный телефон",
        error: (__VLS_ctx.sntValidation.getError('contact_phone')),
        hint: "Телефон правления для владельцев",
    }));
    const __VLS_56 = __VLS_55({
        label: "Контактный телефон",
        error: (__VLS_ctx.sntValidation.getError('contact_phone')),
        hint: "Телефон правления для владельцев",
    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    const { default: __VLS_59 } = __VLS_57.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onBlur: (...[$event]) => {
                if (!(__VLS_ctx.tab === 'snt'))
                    return;
                __VLS_ctx.sntValidation.validateSingle('contact_phone');
                // @ts-ignore
                [sntValidation, sntValidation,];
            } },
        type: "tel",
        placeholder: "+7 900 123-45-67",
    });
    (__VLS_ctx.sntForm.contact_phone);
    // @ts-ignore
    [sntForm,];
    var __VLS_57;
    const __VLS_60 = FormField || FormField;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
        label: "Контактный email",
        error: (__VLS_ctx.sntValidation.getError('contact_email')),
        hint: "Email для обратной связи",
    }));
    const __VLS_62 = __VLS_61({
        label: "Контактный email",
        error: (__VLS_ctx.sntValidation.getError('contact_email')),
        hint: "Email для обратной связи",
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    const { default: __VLS_65 } = __VLS_63.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onBlur: (...[$event]) => {
                if (!(__VLS_ctx.tab === 'snt'))
                    return;
                __VLS_ctx.sntValidation.validateSingle('contact_email');
                // @ts-ignore
                [sntValidation, sntValidation,];
            } },
        type: "email",
        placeholder: "info@snt.ru",
    });
    (__VLS_ctx.sntForm.contact_email);
    // @ts-ignore
    [sntForm,];
    var __VLS_63;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        type: "submit",
        ...{ class: "btn btn-primary" },
        disabled: (__VLS_ctx.sntLoading),
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: (__VLS_ctx.sntLoading ? 'pi pi-spinner pi-spin' : 'pi pi-save') },
    });
}
if (__VLS_ctx.tab === 'notifications') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-section" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-card card" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-card-header" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-card-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-bell" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-bell']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (__VLS_ctx.saveNotifications) },
        ...{ class: "settings-form" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-form']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "toggle-group main-toggle" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['main-toggle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "toggle-label" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "checkbox",
    });
    (__VLS_ctx.notificationsForm.email_enabled);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "toggle-switch" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "toggle-info" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "toggle-title" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "toggle-desc" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-desc']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "notifications-details" },
        ...{ class: ({ disabled: !__VLS_ctx.notificationsForm.email_enabled }) },
    });
    /** @type {__VLS_StyleScopedClasses['notifications-details']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "toggle-group" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "toggle-label" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "checkbox",
        disabled: (!__VLS_ctx.notificationsForm.email_enabled),
    });
    (__VLS_ctx.notificationsForm.notify_new_appeals);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "toggle-switch" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "toggle-info" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "toggle-title" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "toggle-desc" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-desc']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "toggle-group" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "toggle-label" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "checkbox",
        disabled: (!__VLS_ctx.notificationsForm.email_enabled),
    });
    (__VLS_ctx.notificationsForm.notify_meter_readings);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "toggle-switch" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "toggle-info" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "toggle-title" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "toggle-desc" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-desc']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "toggle-group" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "toggle-label" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "checkbox",
        disabled: (!__VLS_ctx.notificationsForm.email_enabled),
    });
    (__VLS_ctx.notificationsForm.notify_debt_reminder);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "toggle-switch" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "toggle-info" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "toggle-title" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "toggle-desc" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-desc']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-divider" },
    });
    /** @type {__VLS_StyleScopedClasses['form-divider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-row" },
    });
    /** @type {__VLS_StyleScopedClasses['form-row']} */ ;
    const __VLS_66 = FormField || FormField;
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({
        label: "Крайний день подачи показаний",
        hint: (`Владельцы должны передать до ${__VLS_ctx.notificationsForm.meter_deadline_day}-го числа`),
    }));
    const __VLS_68 = __VLS_67({
        label: "Крайний день подачи показаний",
        hint: (`Владельцы должны передать до ${__VLS_ctx.notificationsForm.meter_deadline_day}-го числа`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    const { default: __VLS_71 } = __VLS_69.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "1",
        max: "28",
        disabled: (!__VLS_ctx.notificationsForm.email_enabled),
    });
    (__VLS_ctx.notificationsForm.meter_deadline_day);
    // @ts-ignore
    [tab, sntLoading, sntLoading, saveNotifications, notificationsForm, notificationsForm, notificationsForm, notificationsForm, notificationsForm, notificationsForm, notificationsForm, notificationsForm, notificationsForm, notificationsForm, notificationsForm,];
    var __VLS_69;
    const __VLS_72 = FormField || FormField;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
        label: "День отправки напоминаний",
        hint: (`Напоминания уходят ${__VLS_ctx.notificationsForm.debt_reminder_day}-го числа`),
    }));
    const __VLS_74 = __VLS_73({
        label: "День отправки напоминаний",
        hint: (`Напоминания уходят ${__VLS_ctx.notificationsForm.debt_reminder_day}-го числа`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    const { default: __VLS_77 } = __VLS_75.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "1",
        max: "28",
        disabled: (!__VLS_ctx.notificationsForm.email_enabled),
    });
    (__VLS_ctx.notificationsForm.debt_reminder_day);
    // @ts-ignore
    [notificationsForm, notificationsForm, notificationsForm,];
    var __VLS_75;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        type: "submit",
        ...{ class: "btn btn-primary" },
        disabled: (__VLS_ctx.notificationsLoading),
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: (__VLS_ctx.notificationsLoading ? 'pi pi-spinner pi-spin' : 'pi pi-save') },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-card card" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-card-header" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-card-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-eye" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-eye']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "email-preview-list" },
    });
    /** @type {__VLS_StyleScopedClasses['email-preview-list']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "email-preview-item" },
    });
    /** @type {__VLS_StyleScopedClasses['email-preview-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "email-preview-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['email-preview-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-envelope" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-envelope']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "email-preview-info" },
    });
    /** @type {__VLS_StyleScopedClasses['email-preview-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "badge badge-success" },
    });
    /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['badge-success']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "email-preview-item" },
    });
    /** @type {__VLS_StyleScopedClasses['email-preview-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "email-preview-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['email-preview-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-reply" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-reply']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "email-preview-info" },
    });
    /** @type {__VLS_StyleScopedClasses['email-preview-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "badge badge-success" },
    });
    /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['badge-success']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "email-preview-item" },
    });
    /** @type {__VLS_StyleScopedClasses['email-preview-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "email-preview-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['email-preview-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-megaphone" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-megaphone']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "email-preview-info" },
    });
    /** @type {__VLS_StyleScopedClasses['email-preview-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "badge badge-success" },
    });
    /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['badge-success']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "email-preview-item" },
    });
    /** @type {__VLS_StyleScopedClasses['email-preview-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "email-preview-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['email-preview-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-exclamation-triangle" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-exclamation-triangle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "email-preview-info" },
    });
    /** @type {__VLS_StyleScopedClasses['email-preview-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: ([
                'badge',
                __VLS_ctx.notificationsForm.notify_debt_reminder &&
                    __VLS_ctx.notificationsForm.email_enabled
                    ? 'badge-success'
                    : 'badge-danger',
            ]) },
    });
    /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    (__VLS_ctx.notificationsForm.notify_debt_reminder &&
        __VLS_ctx.notificationsForm.email_enabled
        ? "Включено"
        : "Выключено");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "email-preview-item" },
    });
    /** @type {__VLS_StyleScopedClasses['email-preview-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "email-preview-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['email-preview-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-inbox" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-inbox']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "email-preview-info" },
    });
    /** @type {__VLS_StyleScopedClasses['email-preview-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: ([
                'badge',
                __VLS_ctx.notificationsForm.notify_new_appeals &&
                    __VLS_ctx.notificationsForm.email_enabled
                    ? 'badge-success'
                    : 'badge-danger',
            ]) },
    });
    /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    (__VLS_ctx.notificationsForm.notify_new_appeals &&
        __VLS_ctx.notificationsForm.email_enabled
        ? "Включено"
        : "Выключено");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "email-preview-item" },
    });
    /** @type {__VLS_StyleScopedClasses['email-preview-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "email-preview-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['email-preview-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-gauge" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-gauge']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "email-preview-info" },
    });
    /** @type {__VLS_StyleScopedClasses['email-preview-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: ([
                'badge',
                __VLS_ctx.notificationsForm.notify_meter_readings &&
                    __VLS_ctx.notificationsForm.email_enabled
                    ? 'badge-success'
                    : 'badge-danger',
            ]) },
    });
    /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    (__VLS_ctx.notificationsForm.notify_meter_readings &&
        __VLS_ctx.notificationsForm.email_enabled
        ? "Включено"
        : "Выключено");
}
// @ts-ignore
[notificationsForm, notificationsForm, notificationsForm, notificationsForm, notificationsForm, notificationsForm, notificationsForm, notificationsForm, notificationsForm, notificationsForm, notificationsForm, notificationsForm, notificationsLoading, notificationsLoading,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
