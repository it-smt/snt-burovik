import { ref, onMounted } from "vue";
import { useAppToast } from "@/composables/useToast";
import { usersApi, } from "@/api/users";
import UserFormModal from "@/components/users/UserFormModal.vue";
import ConfirmModal from "@/components/common/ConfirmModal.vue";
import Pagination from "@/components/common/Pagination.vue";
import Skeleton from "@/components/common/Skeleton.vue";
import UserAvatar from "@/components/common/UserAvatar.vue";
const toast = useAppToast();
const users = ref([]);
const loading = ref(true);
const search = ref("");
const roleFilter = ref("");
// Пагинация
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const perPage = ref(10);
// Модалки
const showForm = ref(false);
const editingUser = ref(null);
const showConfirm = ref(false);
const userToDelete = ref(null);
const showPasswordModal = ref(false);
const tempPassword = ref("");
const passwordUser = ref(null);
const roles = [
    { value: "", label: "Все роли" },
    { value: "owner", label: "Владельцы" },
    { value: "chairman", label: "Председатели" },
    { value: "accountant", label: "Бухгалтеры" },
    { value: "admin", label: "Администраторы" },
];
const roleLabels = {
    owner: "Владелец",
    chairman: "Председатель",
    accountant: "Бухгалтер",
    admin: "Администратор",
};
const roleColors = {
    owner: "#22c55e",
    chairman: "#6366f1",
    accountant: "#f59e0b",
    admin: "#ef4444",
};
async function loadUsers() {
    loading.value = true;
    try {
        const { data } = await usersApi.getAll({
            search: search.value || undefined,
            role: roleFilter.value || undefined,
            page: currentPage.value,
            per_page: perPage.value,
        });
        users.value = data.items;
        totalPages.value = data.pages;
        totalItems.value = data.total;
    }
    catch {
        toast.error("Не удалось загрузить пользователей");
    }
    finally {
        loading.value = false;
    }
}
onMounted(loadUsers);
function openCreateForm() {
    editingUser.value = null;
    showForm.value = true;
}
function openEditForm(user) {
    editingUser.value = user;
    showForm.value = true;
}
async function handleSave(data) {
    try {
        if (editingUser.value) {
            await usersApi.update(editingUser.value.id, data);
            toast.success("Пользователь обновлён");
        }
        else {
            await usersApi.create(data);
            toast.success("Пользователь создан");
        }
        showForm.value = false;
        await loadUsers();
    }
    catch (e) {
        const msg = e.response?.data?.detail || "Не удалось сохранить";
        toast.error(msg);
    }
}
function confirmDelete(user) {
    userToDelete.value = user;
    showConfirm.value = true;
}
async function handleDelete() {
    if (!userToDelete.value)
        return;
    try {
        await usersApi.delete(userToDelete.value.id);
        toast.success(`${userToDelete.value.full_name} удалён`);
        showConfirm.value = false;
        userToDelete.value = null;
        await loadUsers();
    }
    catch {
        toast.error("Не удалось удалить пользователя");
    }
}
async function resetPassword(user) {
    try {
        const { data } = await usersApi.resetPassword(user.id);
        tempPassword.value = data.temp_password;
        passwordUser.value = user;
        showPasswordModal.value = true;
        toast.success("Пароль сброшен");
    }
    catch {
        toast.error("Не удалось сбросить пароль");
    }
}
async function toggleActive(user) {
    try {
        await usersApi.update(user.id, { is_active: !user.is_active });
        toast.success(user.is_active
            ? "Пользователь заблокирован"
            : "Пользователь разблокирован");
        await loadUsers();
    }
    catch {
        toast.error("Не удалось изменить статус");
    }
}
function changePage(page) {
    if (page < 1 || page > totalPages.value)
        return;
    currentPage.value = page;
    loadUsers();
}
let searchTimeout;
function onSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentPage.value = 1;
        loadUsers();
    }, 300);
}
function onFilterChange() {
    currentPage.value = 1;
    loadUsers();
}
function copyPassword() {
    navigator.clipboard.writeText(tempPassword.value);
    toast.info("Пароль скопирован в буфер обмена");
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "users-page" },
});
/** @type {__VLS_StyleScopedClasses['users-page']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "page-title" },
});
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.openCreateForm) },
    ...{ class: "btn btn-primary" },
});
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "pi pi-plus" },
});
/** @type {__VLS_StyleScopedClasses['pi']} */ ;
/** @type {__VLS_StyleScopedClasses['pi-plus']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "btn-text" },
});
/** @type {__VLS_StyleScopedClasses['btn-text']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "filters" },
});
/** @type {__VLS_StyleScopedClasses['filters']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "search-box" },
});
/** @type {__VLS_StyleScopedClasses['search-box']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "pi pi-search" },
});
/** @type {__VLS_StyleScopedClasses['pi']} */ ;
/** @type {__VLS_StyleScopedClasses['pi-search']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onInput: (__VLS_ctx.onSearchInput) },
    value: (__VLS_ctx.search),
    type: "text",
    placeholder: "Поиск...",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    ...{ onChange: (__VLS_ctx.onFilterChange) },
    value: (__VLS_ctx.roleFilter),
    ...{ class: "select" },
});
/** @type {__VLS_StyleScopedClasses['select']} */ ;
for (const [r] of __VLS_vFor((__VLS_ctx.roles))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        key: (r.value),
        value: (r.value),
    });
    (r.label);
    // @ts-ignore
    [openCreateForm, onSearchInput, search, onFilterChange, roleFilter, roles,];
}
if (__VLS_ctx.loading) {
    const __VLS_0 = Skeleton;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        type: "table",
        count: (5),
    }));
    const __VLS_2 = __VLS_1({
        type: "table",
        count: (5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_5 = Skeleton;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        type: "card",
        count: (3),
    }));
    const __VLS_7 = __VLS_6({
        type: "card",
        count: (3),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "table-container" },
    });
    /** @type {__VLS_StyleScopedClasses['table-container']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
        ...{ class: "data-table" },
    });
    /** @type {__VLS_StyleScopedClasses['data-table']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
    for (const [user] of __VLS_vFor((__VLS_ctx.users))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
            key: (user.id),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "user-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['user-cell']} */ ;
        const __VLS_10 = UserAvatar;
        // @ts-ignore
        const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
            name: (user.full_name),
            role: (user.role),
        }));
        const __VLS_12 = __VLS_11({
            name: (user.full_name),
            role: (user.role),
        }, ...__VLS_functionalComponentArgsRest(__VLS_11));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "user-name" },
        });
        /** @type {__VLS_StyleScopedClasses['user-name']} */ ;
        (user.full_name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "contacts-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['contacts-cell']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-envelope" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-envelope']} */ ;
        (user.email);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-phone" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-phone']} */ ;
        (user.phone);
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "badge" },
            ...{ style: ({
                    background: __VLS_ctx.roleColors[user.role] + '20',
                    color: __VLS_ctx.roleColors[user.role],
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['badge']} */ ;
        (__VLS_ctx.roleLabels[user.role]);
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: ([
                    'badge',
                    user.is_active ? 'badge-success' : 'badge-danger',
                ]) },
        });
        /** @type {__VLS_StyleScopedClasses['badge']} */ ;
        (user.is_active ? "Активен" : "Заблокирован");
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "table-actions" },
        });
        /** @type {__VLS_StyleScopedClasses['table-actions']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    __VLS_ctx.openEditForm(user);
                    // @ts-ignore
                    [loading, users, roleColors, roleColors, roleLabels, openEditForm,];
                } },
            ...{ class: "action-btn" },
            title: "Редактировать",
        });
        /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-pencil" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-pencil']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    __VLS_ctx.resetPassword(user);
                    // @ts-ignore
                    [resetPassword,];
                } },
            ...{ class: "action-btn" },
            title: "Сбросить пароль",
        });
        /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-key" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-key']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    __VLS_ctx.toggleActive(user);
                    // @ts-ignore
                    [toggleActive,];
                } },
            ...{ class: "action-btn" },
            title: (user.is_active ? 'Заблокировать' : 'Разблокировать'),
        });
        /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: (user.is_active ? 'pi pi-lock' : 'pi pi-lock-open') },
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    __VLS_ctx.confirmDelete(user);
                    // @ts-ignore
                    [confirmDelete,];
                } },
            ...{ class: "action-btn danger" },
            title: "Удалить",
        });
        /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['danger']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-trash" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-trash']} */ ;
        // @ts-ignore
        [];
    }
    if (__VLS_ctx.users.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            colspan: "5",
            ...{ class: "empty-row" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-row']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mobile-cards" },
    });
    /** @type {__VLS_StyleScopedClasses['mobile-cards']} */ ;
    for (const [user] of __VLS_vFor((__VLS_ctx.users))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (user.id),
            ...{ class: "mobile-card" },
        });
        /** @type {__VLS_StyleScopedClasses['mobile-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mobile-card-header" },
        });
        /** @type {__VLS_StyleScopedClasses['mobile-card-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "user-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['user-cell']} */ ;
        const __VLS_15 = UserAvatar;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
            name: (user.full_name),
            role: (user.role),
        }));
        const __VLS_17 = __VLS_16({
            name: (user.full_name),
            role: (user.role),
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "user-name" },
        });
        /** @type {__VLS_StyleScopedClasses['user-name']} */ ;
        (user.full_name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "badge" },
            ...{ style: ({
                    background: __VLS_ctx.roleColors[user.role] + '20',
                    color: __VLS_ctx.roleColors[user.role],
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['badge']} */ ;
        (__VLS_ctx.roleLabels[user.role]);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: ([
                    'badge',
                    user.is_active ? 'badge-success' : 'badge-danger',
                ]) },
        });
        /** @type {__VLS_StyleScopedClasses['badge']} */ ;
        (user.is_active ? "Активен" : "Заблокирован");
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mobile-card-body" },
        });
        /** @type {__VLS_StyleScopedClasses['mobile-card-body']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mobile-card-row" },
        });
        /** @type {__VLS_StyleScopedClasses['mobile-card-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "label" },
        });
        /** @type {__VLS_StyleScopedClasses['label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-envelope" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-envelope']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "value" },
        });
        /** @type {__VLS_StyleScopedClasses['value']} */ ;
        (user.email);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mobile-card-row" },
        });
        /** @type {__VLS_StyleScopedClasses['mobile-card-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "label" },
        });
        /** @type {__VLS_StyleScopedClasses['label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-phone" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-phone']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "value" },
        });
        /** @type {__VLS_StyleScopedClasses['value']} */ ;
        (user.phone);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mobile-card-footer" },
        });
        /** @type {__VLS_StyleScopedClasses['mobile-card-footer']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    __VLS_ctx.openEditForm(user);
                    // @ts-ignore
                    [users, users, roleColors, roleColors, roleLabels, openEditForm,];
                } },
            ...{ class: "btn btn-sm btn-secondary" },
        });
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-pencil" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-pencil']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    __VLS_ctx.resetPassword(user);
                    // @ts-ignore
                    [resetPassword,];
                } },
            ...{ class: "btn btn-sm btn-secondary" },
        });
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-key" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-key']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    __VLS_ctx.confirmDelete(user);
                    // @ts-ignore
                    [confirmDelete,];
                } },
            ...{ class: "btn btn-sm btn-danger" },
        });
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-danger']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-trash" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-trash']} */ ;
        // @ts-ignore
        [];
    }
    if (__VLS_ctx.users.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "empty-state" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-users" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-users']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.openCreateForm) },
            ...{ class: "btn btn-primary" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-plus" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-plus']} */ ;
    }
    if (__VLS_ctx.totalPages > 1) {
        const __VLS_20 = Pagination;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
            ...{ 'onChange': {} },
            currentPage: (__VLS_ctx.currentPage),
            totalPages: (__VLS_ctx.totalPages),
            totalItems: (__VLS_ctx.totalItems),
        }));
        const __VLS_22 = __VLS_21({
            ...{ 'onChange': {} },
            currentPage: (__VLS_ctx.currentPage),
            totalPages: (__VLS_ctx.totalPages),
            totalItems: (__VLS_ctx.totalItems),
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        let __VLS_25;
        const __VLS_26 = ({ change: {} },
            { onChange: (__VLS_ctx.changePage) });
        var __VLS_23;
        var __VLS_24;
    }
}
if (__VLS_ctx.showForm) {
    const __VLS_27 = UserFormModal;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
        ...{ 'onClose': {} },
        ...{ 'onSave': {} },
        user: (__VLS_ctx.editingUser),
    }));
    const __VLS_29 = __VLS_28({
        ...{ 'onClose': {} },
        ...{ 'onSave': {} },
        user: (__VLS_ctx.editingUser),
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    let __VLS_32;
    const __VLS_33 = ({ close: {} },
        { onClose: (...[$event]) => {
                if (!(__VLS_ctx.showForm))
                    return;
                __VLS_ctx.showForm = false;
                // @ts-ignore
                [openCreateForm, users, totalPages, totalPages, currentPage, totalItems, changePage, showForm, showForm, editingUser,];
            } });
    const __VLS_34 = ({ save: {} },
        { onSave: (__VLS_ctx.handleSave) });
    var __VLS_30;
    var __VLS_31;
}
if (__VLS_ctx.showConfirm) {
    const __VLS_35 = ConfirmModal;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
        ...{ 'onClose': {} },
        ...{ 'onConfirm': {} },
        title: "Удалить пользователя?",
        message: (`Вы уверены, что хотите удалить ${__VLS_ctx.userToDelete?.full_name}?`),
        confirmText: "Удалить",
        danger: true,
    }));
    const __VLS_37 = __VLS_36({
        ...{ 'onClose': {} },
        ...{ 'onConfirm': {} },
        title: "Удалить пользователя?",
        message: (`Вы уверены, что хотите удалить ${__VLS_ctx.userToDelete?.full_name}?`),
        confirmText: "Удалить",
        danger: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    let __VLS_40;
    const __VLS_41 = ({ close: {} },
        { onClose: (...[$event]) => {
                if (!(__VLS_ctx.showConfirm))
                    return;
                __VLS_ctx.showConfirm = false;
                // @ts-ignore
                [handleSave, showConfirm, showConfirm, userToDelete,];
            } });
    const __VLS_42 = ({ confirm: {} },
        { onConfirm: (__VLS_ctx.handleDelete) });
    var __VLS_38;
    var __VLS_39;
}
if (__VLS_ctx.showPasswordModal) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showPasswordModal))
                    return;
                __VLS_ctx.showPasswordModal = false;
                // @ts-ignore
                [handleDelete, showPasswordModal, showPasswordModal,];
            } },
        ...{ class: "modal-overlay" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal" },
    });
    /** @type {__VLS_StyleScopedClasses['modal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-header" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showPasswordModal))
                    return;
                __VLS_ctx.showPasswordModal = false;
                // @ts-ignore
                [showPasswordModal,];
            } },
        ...{ class: "close-btn" },
    });
    /** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-times" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-times']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-body" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.passwordUser?.full_name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "password-display" },
    });
    /** @type {__VLS_StyleScopedClasses['password-display']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.code, __VLS_intrinsics.code)({});
    (__VLS_ctx.tempPassword);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.copyPassword) },
        ...{ class: "btn btn-sm btn-secondary" },
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-copy" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-copy']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "hint" },
    });
    /** @type {__VLS_StyleScopedClasses['hint']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-info-circle" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-info-circle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showPasswordModal))
                    return;
                __VLS_ctx.showPasswordModal = false;
                // @ts-ignore
                [showPasswordModal, passwordUser, tempPassword, copyPassword,];
            } },
        ...{ class: "btn btn-primary" },
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
