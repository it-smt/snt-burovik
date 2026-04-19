import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useAppToast } from "@/composables/useToast";
import { useValidation } from "@/composables/useValidation";
import { appealsApi } from "@/api/appeals";
import { plotsApi } from "@/api/plots";
import ConfirmModal from "@/components/common/ConfirmModal.vue";
import FormField from "@/components/common/FormField.vue";
const auth = useAuthStore();
const toast = useAppToast();
const appeals = ref([]);
const plots = ref([]);
const loading = ref(true);
const statusFilter = ref("");
// Модалки
const showCreateForm = ref(false);
const showRespondForm = ref(false);
const showDetail = ref(false);
const selectedAppeal = ref(null);
const showConfirm = ref(false);
const toDelete = ref(null);
// Формы
const createForm = ref({
    plot_id: 0,
    subject: "",
    message: "",
});
const respondForm = ref({
    response: "",
    status: "resolved",
});
// Валидация создания
const createValidation = useValidation(() => createForm.value, {
    plot_id: {
        required: true,
        min: 1,
        message: "Выберите участок",
    },
    subject: {
        required: true,
        minLength: 5,
        maxLength: 200,
        message: "Тема от 5 до 200 символов",
    },
    message: {
        required: true,
        minLength: 10,
        maxLength: 2000,
        message: "Сообщение от 10 до 2000 символов",
    },
});
// Валидация ответа
const respondValidation = useValidation(() => respondForm.value, {
    response: {
        required: true,
        minLength: 5,
        message: "Введите ответ (минимум 5 символов)",
    },
});
// Справочники
const statusLabels = {
    new: "Новое",
    in_progress: "В работе",
    resolved: "Решено",
    rejected: "Отклонено",
};
const statusColors = {
    new: "badge-info",
    in_progress: "badge-warning",
    resolved: "badge-success",
    rejected: "badge-danger",
};
const statusOptions = [
    { value: "", label: "Все статусы" },
    { value: "new", label: "Новые" },
    { value: "in_progress", label: "В работе" },
    { value: "resolved", label: "Решённые" },
    { value: "rejected", label: "Отклонённые" },
];
// Статистика
const stats = computed(() => ({
    total: appeals.value.length,
    new: appeals.value.filter((a) => a.status === "new").length,
    in_progress: appeals.value.filter((a) => a.status === "in_progress").length,
    resolved: appeals.value.filter((a) => a.status === "resolved" || a.status === "rejected").length,
}));
// ========== Методы ==========
async function load() {
    loading.value = true;
    try {
        const [appealsRes, plotsRes] = await Promise.all([
            appealsApi.getAll({ status: statusFilter.value || undefined }),
            plotsApi.getAll(),
        ]);
        appeals.value = appealsRes.data.items;
        plots.value = plotsRes.data.items;
    }
    catch {
        toast.error("Не удалось загрузить обращения");
    }
    finally {
        loading.value = false;
    }
}
onMounted(load);
function getPlotNumber(id) {
    return plots.value.find((p) => p.id === id)?.number || `#${id}`;
}
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}
function getAvailablePlots() {
    if (auth.isOwner) {
        return plots.value.filter((p) => p.owner_id === auth.user?.id);
    }
    return plots.value;
}
// Создание обращения
function openCreateForm() {
    const myPlots = getAvailablePlots();
    createForm.value = {
        plot_id: myPlots[0]?.id || 0,
        subject: "",
        message: "",
    };
    createValidation.resetErrors();
    showCreateForm.value = true;
}
async function saveAppeal() {
    if (!createValidation.validate())
        return;
    try {
        await appealsApi.create(createForm.value);
        showCreateForm.value = false;
        createValidation.resetErrors();
        toast.success("Обращение отправлено");
        await load();
    }
    catch {
        toast.error("Не удалось создать обращение");
    }
}
// Детали
function openDetail(appeal) {
    selectedAppeal.value = appeal;
    showDetail.value = true;
}
// Ответ
function openRespondForm(appeal) {
    selectedAppeal.value = appeal;
    respondForm.value = {
        response: appeal.response || "",
        status: appeal.status === "new" || appeal.status === "in_progress"
            ? "resolved"
            : appeal.status,
    };
    respondValidation.resetErrors();
    showDetail.value = false;
    showRespondForm.value = true;
}
async function saveResponse() {
    if (!respondValidation.validate())
        return;
    if (!selectedAppeal.value)
        return;
    try {
        await appealsApi.respond(selectedAppeal.value.id, respondForm.value);
        showRespondForm.value = false;
        respondValidation.resetErrors();
        toast.success("Ответ отправлен");
        await load();
    }
    catch {
        toast.error("Не удалось отправить ответ");
    }
}
// Удаление
async function confirmDelete() {
    if (!toDelete.value)
        return;
    try {
        await appealsApi.delete(toDelete.value.id);
        showConfirm.value = false;
        toDelete.value = null;
        toast.success("Обращение удалено");
        await load();
    }
    catch {
        toast.error("Не удалось удалить обращение");
    }
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "appeals-page" },
});
/** @type {__VLS_StyleScopedClasses['appeals-page']} */ ;
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
if (__VLS_ctx.auth.isStaff) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stats-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-card" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-icon" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-envelope" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-envelope']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-value" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
    (__VLS_ctx.stats.total);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-card" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-icon" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-inbox" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-inbox']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-value" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
    (__VLS_ctx.stats.new);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-card" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-icon" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-clock" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-clock']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-value" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
    (__VLS_ctx.stats.in_progress);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-card" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-icon" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-check-circle" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-check-circle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-value" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
    (__VLS_ctx.stats.resolved);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "filters" },
});
/** @type {__VLS_StyleScopedClasses['filters']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    ...{ onChange: (__VLS_ctx.load) },
    value: (__VLS_ctx.statusFilter),
    ...{ class: "select" },
});
/** @type {__VLS_StyleScopedClasses['select']} */ ;
for (const [opt] of __VLS_vFor((__VLS_ctx.statusOptions))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        key: (opt.value),
        value: (opt.value),
    });
    (opt.label);
    // @ts-ignore
    [openCreateForm, auth, stats, stats, stats, stats, load, statusFilter, statusOptions,];
}
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "loading" },
    });
    /** @type {__VLS_StyleScopedClasses['loading']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-spinner pi-spin" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-spinner']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-spin']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "appeals-list" },
    });
    /** @type {__VLS_StyleScopedClasses['appeals-list']} */ ;
    for (const [appeal] of __VLS_vFor((__VLS_ctx.appeals))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    __VLS_ctx.openDetail(appeal);
                    // @ts-ignore
                    [loading, appeals, openDetail,];
                } },
            key: (appeal.id),
            ...{ class: "appeal-card card" },
        });
        /** @type {__VLS_StyleScopedClasses['appeal-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "appeal-header" },
        });
        /** @type {__VLS_StyleScopedClasses['appeal-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "appeal-title-row" },
        });
        /** @type {__VLS_StyleScopedClasses['appeal-title-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        (appeal.subject);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: (['badge', __VLS_ctx.statusColors[appeal.status]]) },
        });
        /** @type {__VLS_StyleScopedClasses['badge']} */ ;
        (__VLS_ctx.statusLabels[appeal.status]);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "appeal-meta" },
        });
        /** @type {__VLS_StyleScopedClasses['appeal-meta']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "appeal-plot" },
        });
        /** @type {__VLS_StyleScopedClasses['appeal-plot']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-map" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-map']} */ ;
        (__VLS_ctx.getPlotNumber(appeal.plot_id));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "appeal-date" },
        });
        /** @type {__VLS_StyleScopedClasses['appeal-date']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-calendar" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-calendar']} */ ;
        (__VLS_ctx.formatDate(appeal.created_at));
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "appeal-message" },
        });
        /** @type {__VLS_StyleScopedClasses['appeal-message']} */ ;
        (appeal.message);
        if (appeal.response) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "appeal-response" },
            });
            /** @type {__VLS_StyleScopedClasses['appeal-response']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "response-header" },
            });
            /** @type {__VLS_StyleScopedClasses['response-header']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
                ...{ class: "pi pi-reply" },
            });
            /** @type {__VLS_StyleScopedClasses['pi']} */ ;
            /** @type {__VLS_StyleScopedClasses['pi-reply']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            (appeal.response);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: () => { } },
            ...{ class: "appeal-actions" },
        });
        /** @type {__VLS_StyleScopedClasses['appeal-actions']} */ ;
        if (__VLS_ctx.auth.isStaff) {
            if (appeal.status === 'new' || appeal.status === 'in_progress') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.loading))
                                return;
                            if (!(__VLS_ctx.auth.isStaff))
                                return;
                            if (!(appeal.status === 'new' || appeal.status === 'in_progress'))
                                return;
                            __VLS_ctx.openRespondForm(appeal);
                            // @ts-ignore
                            [auth, statusColors, statusLabels, getPlotNumber, formatDate, openRespondForm,];
                        } },
                    ...{ class: "btn btn-sm btn-primary" },
                });
                /** @type {__VLS_StyleScopedClasses['btn']} */ ;
                /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
                    ...{ class: "pi pi-reply" },
                });
                /** @type {__VLS_StyleScopedClasses['pi']} */ ;
                /** @type {__VLS_StyleScopedClasses['pi-reply']} */ ;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.auth.isStaff))
                            return;
                        __VLS_ctx.toDelete = appeal;
                        __VLS_ctx.showConfirm = true;
                        ;
                        // @ts-ignore
                        [toDelete, showConfirm,];
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
        }
        // @ts-ignore
        [];
    }
    if (!__VLS_ctx.appeals.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "empty-state" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-envelope" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-envelope']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    }
}
if (__VLS_ctx.showDetail && __VLS_ctx.selectedAppeal) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedAppeal))
                    return;
                __VLS_ctx.showDetail = false;
                // @ts-ignore
                [appeals, showDetail, showDetail, selectedAppeal,];
            } },
        ...{ class: "modal-overlay" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal appeal-detail-modal" },
    });
    /** @type {__VLS_StyleScopedClasses['modal']} */ ;
    /** @type {__VLS_StyleScopedClasses['appeal-detail-modal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-header" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedAppeal))
                    return;
                __VLS_ctx.showDetail = false;
                // @ts-ignore
                [showDetail,];
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-section" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-row" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "detail-label" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: (['badge', __VLS_ctx.statusColors[__VLS_ctx.selectedAppeal.status]]) },
    });
    /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    (__VLS_ctx.statusLabels[__VLS_ctx.selectedAppeal.status]);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-row" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "detail-label" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "detail-value" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
    (__VLS_ctx.getPlotNumber(__VLS_ctx.selectedAppeal.plot_id));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-row" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "detail-label" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "detail-value" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
    (__VLS_ctx.formatDate(__VLS_ctx.selectedAppeal.created_at));
    if (__VLS_ctx.selectedAppeal.resolved_at) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-value" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
        (__VLS_ctx.formatDate(__VLS_ctx.selectedAppeal.resolved_at));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-section" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    (__VLS_ctx.selectedAppeal.subject);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "detail-message" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-message']} */ ;
    (__VLS_ctx.selectedAppeal.message);
    if (__VLS_ctx.selectedAppeal.response) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-section response-section" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
        /** @type {__VLS_StyleScopedClasses['response-section']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-reply" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-reply']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "detail-message" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-message']} */ ;
        (__VLS_ctx.selectedAppeal.response);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedAppeal))
                    return;
                __VLS_ctx.showDetail = false;
                // @ts-ignore
                [statusColors, statusLabels, getPlotNumber, formatDate, formatDate, showDetail, selectedAppeal, selectedAppeal, selectedAppeal, selectedAppeal, selectedAppeal, selectedAppeal, selectedAppeal, selectedAppeal, selectedAppeal, selectedAppeal,];
            } },
        ...{ class: "btn btn-secondary" },
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
    if (__VLS_ctx.auth.isStaff &&
        (__VLS_ctx.selectedAppeal.status === 'new' ||
            __VLS_ctx.selectedAppeal.status === 'in_progress')) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedAppeal))
                        return;
                    if (!(__VLS_ctx.auth.isStaff &&
                        (__VLS_ctx.selectedAppeal.status === 'new' ||
                            __VLS_ctx.selectedAppeal.status === 'in_progress')))
                        return;
                    __VLS_ctx.openRespondForm(__VLS_ctx.selectedAppeal);
                    // @ts-ignore
                    [auth, openRespondForm, selectedAppeal, selectedAppeal, selectedAppeal,];
                } },
            ...{ class: "btn btn-primary" },
        });
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-reply" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-reply']} */ ;
    }
}
if (__VLS_ctx.showCreateForm) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showCreateForm))
                    return;
                __VLS_ctx.showCreateForm = false;
                // @ts-ignore
                [showCreateForm, showCreateForm,];
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
                if (!(__VLS_ctx.showCreateForm))
                    return;
                __VLS_ctx.showCreateForm = false;
                // @ts-ignore
                [showCreateForm,];
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
        ...{ onSubmit: (__VLS_ctx.saveAppeal) },
        ...{ class: "modal-body" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
    const __VLS_0 = FormField || FormField;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        label: "Участок",
        error: (__VLS_ctx.createValidation.getError('plot_id')),
        required: true,
    }));
    const __VLS_2 = __VLS_1({
        label: "Участок",
        error: (__VLS_ctx.createValidation.getError('plot_id')),
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const { default: __VLS_5 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        ...{ onChange: (...[$event]) => {
                if (!(__VLS_ctx.showCreateForm))
                    return;
                __VLS_ctx.createValidation.validateSingle('plot_id');
                // @ts-ignore
                [saveAppeal, createValidation, createValidation,];
            } },
        value: (__VLS_ctx.createForm.plot_id),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: (0),
        disabled: true,
    });
    for (const [p] of __VLS_vFor((__VLS_ctx.getAvailablePlots()))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (p.id),
            value: (p.id),
        });
        (p.number);
        (p.address);
        // @ts-ignore
        [createForm, getAvailablePlots,];
    }
    // @ts-ignore
    [];
    var __VLS_3;
    const __VLS_6 = FormField || FormField;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        label: "Тема обращения",
        error: (__VLS_ctx.createValidation.getError('subject')),
        required: true,
    }));
    const __VLS_8 = __VLS_7({
        label: "Тема обращения",
        error: (__VLS_ctx.createValidation.getError('subject')),
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    const { default: __VLS_11 } = __VLS_9.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onBlur: (...[$event]) => {
                if (!(__VLS_ctx.showCreateForm))
                    return;
                __VLS_ctx.createValidation.validateSingle('subject');
                // @ts-ignore
                [createValidation, createValidation,];
            } },
        value: (__VLS_ctx.createForm.subject),
        type: "text",
        placeholder: "Кратко опишите проблему",
    });
    // @ts-ignore
    [createForm,];
    var __VLS_9;
    const __VLS_12 = FormField || FormField;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
        label: "Сообщение",
        error: (__VLS_ctx.createValidation.getError('message')),
        required: true,
        hint: "Подробно опишите ситуацию",
    }));
    const __VLS_14 = __VLS_13({
        label: "Сообщение",
        error: (__VLS_ctx.createValidation.getError('message')),
        required: true,
        hint: "Подробно опишите ситуацию",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    const { default: __VLS_17 } = __VLS_15.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        ...{ onBlur: (...[$event]) => {
                if (!(__VLS_ctx.showCreateForm))
                    return;
                __VLS_ctx.createValidation.validateSingle('message');
                // @ts-ignore
                [createValidation, createValidation,];
            } },
        value: (__VLS_ctx.createForm.message),
        rows: "5",
        placeholder: "Подробно опишите ситуацию...",
    });
    // @ts-ignore
    [createForm,];
    var __VLS_15;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showCreateForm))
                    return;
                __VLS_ctx.showCreateForm = false;
                // @ts-ignore
                [showCreateForm,];
            } },
        type: "button",
        ...{ class: "btn btn-secondary" },
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        type: "submit",
        ...{ class: "btn btn-primary" },
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
}
if (__VLS_ctx.showRespondForm && __VLS_ctx.selectedAppeal) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showRespondForm && __VLS_ctx.selectedAppeal))
                    return;
                __VLS_ctx.showRespondForm = false;
                // @ts-ignore
                [selectedAppeal, showRespondForm, showRespondForm,];
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
                if (!(__VLS_ctx.showRespondForm && __VLS_ctx.selectedAppeal))
                    return;
                __VLS_ctx.showRespondForm = false;
                // @ts-ignore
                [showRespondForm,];
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
        ...{ onSubmit: (__VLS_ctx.saveResponse) },
        ...{ class: "modal-body" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "appeal-quote" },
    });
    /** @type {__VLS_StyleScopedClasses['appeal-quote']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.selectedAppeal.subject);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (__VLS_ctx.selectedAppeal.message);
    const __VLS_18 = FormField || FormField;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        label: "Статус",
        required: true,
    }));
    const __VLS_20 = __VLS_19({
        label: "Статус",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    const { default: __VLS_23 } = __VLS_21.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.respondForm.status),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "in_progress",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "resolved",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "rejected",
    });
    // @ts-ignore
    [selectedAppeal, selectedAppeal, saveResponse, respondForm,];
    var __VLS_21;
    const __VLS_24 = FormField || FormField;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
        label: "Ответ",
        error: (__VLS_ctx.respondValidation.getError('response')),
        required: true,
    }));
    const __VLS_26 = __VLS_25({
        label: "Ответ",
        error: (__VLS_ctx.respondValidation.getError('response')),
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    const { default: __VLS_29 } = __VLS_27.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        ...{ onBlur: (...[$event]) => {
                if (!(__VLS_ctx.showRespondForm && __VLS_ctx.selectedAppeal))
                    return;
                __VLS_ctx.respondValidation.validateSingle('response');
                // @ts-ignore
                [respondValidation, respondValidation,];
            } },
        value: (__VLS_ctx.respondForm.response),
        rows: "5",
        placeholder: "Введите ответ на обращение...",
    });
    // @ts-ignore
    [respondForm,];
    var __VLS_27;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showRespondForm && __VLS_ctx.selectedAppeal))
                    return;
                __VLS_ctx.showRespondForm = false;
                // @ts-ignore
                [showRespondForm,];
            } },
        type: "button",
        ...{ class: "btn btn-secondary" },
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        type: "submit",
        ...{ class: "btn btn-primary" },
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
}
if (__VLS_ctx.showConfirm) {
    const __VLS_30 = ConfirmModal;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        ...{ 'onClose': {} },
        ...{ 'onConfirm': {} },
        title: "Удалить обращение?",
        message: (__VLS_ctx.toDelete?.subject || ''),
        confirmText: "Удалить",
        danger: true,
    }));
    const __VLS_32 = __VLS_31({
        ...{ 'onClose': {} },
        ...{ 'onConfirm': {} },
        title: "Удалить обращение?",
        message: (__VLS_ctx.toDelete?.subject || ''),
        confirmText: "Удалить",
        danger: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    let __VLS_35;
    const __VLS_36 = ({ close: {} },
        { onClose: (...[$event]) => {
                if (!(__VLS_ctx.showConfirm))
                    return;
                __VLS_ctx.showConfirm = false;
                // @ts-ignore
                [toDelete, showConfirm, showConfirm,];
            } });
    const __VLS_37 = ({ confirm: {} },
        { onConfirm: (__VLS_ctx.confirmDelete) });
    var __VLS_33;
    var __VLS_34;
}
// @ts-ignore
[confirmDelete,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
