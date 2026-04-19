import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useAppToast } from "@/composables/useToast";
import { plotsApi, } from "@/api/plots";
import PlotFormModal from "@/components/plots/PlotFormModal.vue";
import ConfirmModal from "@/components/common/ConfirmModal.vue";
import Pagination from "@/components/common/Pagination.vue";
import Skeleton from "@/components/common/Skeleton.vue";
const auth = useAuthStore();
const toast = useAppToast();
const plots = ref([]);
const balances = ref(new Map());
const loading = ref(true);
const search = ref("");
const ownerFilter = ref("");
// Пагинация
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const perPage = ref(10);
// Сортировка
const sortField = ref("number");
const sortDir = ref("asc");
// Модалки
const showForm = ref(false);
const editingPlot = ref(null);
const showConfirm = ref(false);
const plotToDelete = ref(null);
const showDetail = ref(false);
const selectedPlot = ref(null);
const filterOptions = [
    { value: "", label: "Все участки" },
    { value: "with", label: "С владельцем" },
    { value: "without", label: "Без владельца" },
];
// Сортированные данные
const sortedPlots = computed(() => {
    const data = [...plots.value];
    data.sort((a, b) => {
        let cmp = 0;
        if (sortField.value === "number") {
            cmp = a.number.localeCompare(b.number, "ru", { numeric: true });
        }
        else if (sortField.value === "area_sqm") {
            cmp = a.area_sqm - b.area_sqm;
        }
        else if (sortField.value === "balance") {
            const balA = balances.value.get(a.id)?.balance ?? 0;
            const balB = balances.value.get(b.id)?.balance ?? 0;
            cmp = balA - balB;
        }
        return sortDir.value === "asc" ? cmp : -cmp;
    });
    return data;
});
function toggleSort(field) {
    if (sortField.value === field) {
        sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
    }
    else {
        sortField.value = field;
        sortDir.value = "asc";
    }
}
function getSortIcon(field) {
    if (sortField.value !== field)
        return "pi pi-sort-alt";
    return sortDir.value === "asc"
        ? "pi pi-sort-amount-up"
        : "pi pi-sort-amount-down";
}
async function loadPlots() {
    loading.value = true;
    try {
        const hasOwner = ownerFilter.value === "with"
            ? true
            : ownerFilter.value === "without"
                ? false
                : undefined;
        const { data } = await plotsApi.getAll({
            search: search.value || undefined,
            has_owner: hasOwner,
            page: currentPage.value,
            per_page: perPage.value,
        });
        plots.value = data.items;
        totalPages.value = data.pages;
        totalItems.value = data.total;
        const balancesRes = await plotsApi.getAllBalances();
        balances.value = new Map(balancesRes.data.map((b) => [b.plot_id, b]));
    }
    catch {
        toast.error("Не удалось загрузить участки");
    }
    finally {
        loading.value = false;
    }
}
onMounted(loadPlots);
function openCreateForm() {
    editingPlot.value = null;
    showForm.value = true;
}
function openEditForm(plot) {
    editingPlot.value = plot;
    showForm.value = true;
}
function openDetail(plot) {
    selectedPlot.value = plot;
    showDetail.value = true;
}
async function handleSave(data) {
    try {
        if (editingPlot.value) {
            await plotsApi.update(editingPlot.value.id, data);
            toast.success("Участок обновлён");
        }
        else {
            await plotsApi.create(data);
            toast.success("Участок создан");
        }
        showForm.value = false;
        await loadPlots();
    }
    catch (e) {
        const msg = e.response?.data?.detail || "Не удалось сохранить";
        toast.error(msg);
    }
}
function confirmDelete(plot) {
    plotToDelete.value = plot;
    showConfirm.value = true;
}
async function handleDelete() {
    if (!plotToDelete.value)
        return;
    try {
        await plotsApi.delete(plotToDelete.value.id);
        toast.success(`Участок ${plotToDelete.value.number} удалён`);
        showConfirm.value = false;
        plotToDelete.value = null;
        await loadPlots();
    }
    catch {
        toast.error("Не удалось удалить участок");
    }
}
function formatMoney(amount) {
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: 0,
    }).format(Math.abs(amount));
}
function getBalanceClass(balance) {
    if (balance < 0)
        return "debt";
    if (balance > 0)
        return "overpaid";
    return "zero";
}
function changePage(page) {
    if (page < 1 || page > totalPages.value)
        return;
    currentPage.value = page;
    loadPlots();
}
let searchTimeout;
function onSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentPage.value = 1;
        loadPlots();
    }, 300);
}
function onFilterChange() {
    currentPage.value = 1;
    loadPlots();
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "plots-page" },
});
/** @type {__VLS_StyleScopedClasses['plots-page']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "page-title" },
});
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
if (__VLS_ctx.auth.isStaff) {
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
}
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
    placeholder: "Поиск по номеру, адресу, владельцу...",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    ...{ onChange: (__VLS_ctx.onFilterChange) },
    value: (__VLS_ctx.ownerFilter),
    ...{ class: "select" },
});
/** @type {__VLS_StyleScopedClasses['select']} */ ;
for (const [opt] of __VLS_vFor((__VLS_ctx.filterOptions))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        key: (opt.value),
        value: (opt.value),
    });
    (opt.label);
    // @ts-ignore
    [auth, openCreateForm, onSearchInput, search, onFilterChange, ownerFilter, filterOptions,];
}
if (__VLS_ctx.loading) {
    const __VLS_0 = Skeleton;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        type: "stat",
        count: (3),
    }));
    const __VLS_2 = __VLS_1({
        type: "stat",
        count: (3),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_5 = Skeleton;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        type: "table",
        count: (5),
    }));
    const __VLS_7 = __VLS_6({
        type: "table",
        count: (5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    const __VLS_10 = Skeleton;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        type: "card",
        count: (3),
    }));
    const __VLS_12 = __VLS_11({
        type: "card",
        count: (3),
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stats-row" },
    });
    /** @type {__VLS_StyleScopedClasses['stats-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-item" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-value" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
    (__VLS_ctx.totalItems);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-item" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-value" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
    (__VLS_ctx.plots.filter((p) => p.owner_id).length);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-item" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-value" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
    (__VLS_ctx.plots.filter((p) => !p.owner_id).length);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "table-container" },
    });
    /** @type {__VLS_StyleScopedClasses['table-container']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
        ...{ class: "data-table sortable-table" },
    });
    /** @type {__VLS_StyleScopedClasses['data-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['sortable-table']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                __VLS_ctx.toggleSort('number');
                // @ts-ignore
                [loading, totalItems, plots, plots, toggleSort,];
            } },
        ...{ class: "sortable" },
    });
    /** @type {__VLS_StyleScopedClasses['sortable']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: (__VLS_ctx.getSortIcon('number')) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                __VLS_ctx.toggleSort('area_sqm');
                // @ts-ignore
                [toggleSort, getSortIcon,];
            } },
        ...{ class: "sortable" },
    });
    /** @type {__VLS_StyleScopedClasses['sortable']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: (__VLS_ctx.getSortIcon('area_sqm')) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                __VLS_ctx.toggleSort('balance');
                // @ts-ignore
                [toggleSort, getSortIcon,];
            } },
        ...{ class: "sortable" },
    });
    /** @type {__VLS_StyleScopedClasses['sortable']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: (__VLS_ctx.getSortIcon('balance')) },
    });
    if (__VLS_ctx.auth.isStaff) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
    for (const [plot] of __VLS_vFor((__VLS_ctx.sortedPlots))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    __VLS_ctx.openDetail(plot);
                    // @ts-ignore
                    [auth, getSortIcon, sortedPlots, openDetail,];
                } },
            key: (plot.id),
            ...{ class: "clickable-row" },
        });
        /** @type {__VLS_StyleScopedClasses['clickable-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plot-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['plot-cell']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "plot-number" },
        });
        /** @type {__VLS_StyleScopedClasses['plot-number']} */ ;
        (plot.number);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "plot-address" },
        });
        /** @type {__VLS_StyleScopedClasses['plot-address']} */ ;
        (plot.address);
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
        if (plot.owner) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "owner-cell" },
            });
            /** @type {__VLS_StyleScopedClasses['owner-cell']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "owner-name" },
            });
            /** @type {__VLS_StyleScopedClasses['owner-name']} */ ;
            (plot.owner.full_name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "owner-phone" },
            });
            /** @type {__VLS_StyleScopedClasses['owner-phone']} */ ;
            (plot.owner.phone);
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "no-owner" },
            });
            /** @type {__VLS_StyleScopedClasses['no-owner']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "area" },
        });
        /** @type {__VLS_StyleScopedClasses['area']} */ ;
        (plot.area_sqm);
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "connections" },
        });
        /** @type {__VLS_StyleScopedClasses['connections']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "conn-badge" },
            ...{ class: ({ active: plot.has_electricity }) },
            title: "Электричество",
        });
        /** @type {__VLS_StyleScopedClasses['conn-badge']} */ ;
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-bolt" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-bolt']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "conn-badge" },
            ...{ class: ({ active: plot.has_water }) },
            title: "Вода",
        });
        /** @type {__VLS_StyleScopedClasses['conn-badge']} */ ;
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-box" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-box']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "balance-cell" },
            ...{ class: (__VLS_ctx.getBalanceClass(__VLS_ctx.balances.get(plot.id)?.balance ?? 0)) },
        });
        /** @type {__VLS_StyleScopedClasses['balance-cell']} */ ;
        ((__VLS_ctx.balances.get(plot.id)?.balance ?? 0) < 0 ? "-" : "");
        (__VLS_ctx.formatMoney(__VLS_ctx.balances.get(plot.id)?.balance ?? 0));
        if (__VLS_ctx.auth.isStaff) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ onClick: () => { } },
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "table-actions" },
            });
            /** @type {__VLS_StyleScopedClasses['table-actions']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.auth.isStaff))
                            return;
                        __VLS_ctx.openEditForm(plot);
                        // @ts-ignore
                        [auth, getBalanceClass, balances, balances, balances, formatMoney, openEditForm,];
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
                        if (!(__VLS_ctx.auth.isStaff))
                            return;
                        __VLS_ctx.confirmDelete(plot);
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
        }
        // @ts-ignore
        [];
    }
    if (__VLS_ctx.plots.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            colspan: (__VLS_ctx.auth.isStaff ? 6 : 5),
            ...{ class: "empty-row" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-row']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mobile-cards" },
    });
    /** @type {__VLS_StyleScopedClasses['mobile-cards']} */ ;
    for (const [plot] of __VLS_vFor((__VLS_ctx.sortedPlots))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    __VLS_ctx.openDetail(plot);
                    // @ts-ignore
                    [auth, plots, sortedPlots, openDetail,];
                } },
            key: (plot.id),
            ...{ class: "mobile-card plot-mobile-card" },
        });
        /** @type {__VLS_StyleScopedClasses['mobile-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['plot-mobile-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mobile-card-header" },
        });
        /** @type {__VLS_StyleScopedClasses['mobile-card-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plot-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['plot-cell']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "plot-number" },
        });
        /** @type {__VLS_StyleScopedClasses['plot-number']} */ ;
        (plot.number);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "plot-address" },
        });
        /** @type {__VLS_StyleScopedClasses['plot-address']} */ ;
        (plot.address);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "balance-badge" },
            ...{ class: (__VLS_ctx.getBalanceClass(__VLS_ctx.balances.get(plot.id)?.balance ?? 0)) },
        });
        /** @type {__VLS_StyleScopedClasses['balance-badge']} */ ;
        ((__VLS_ctx.balances.get(plot.id)?.balance ?? 0) < 0 ? "-" : "");
        (__VLS_ctx.formatMoney(__VLS_ctx.balances.get(plot.id)?.balance ?? 0));
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "value" },
        });
        /** @type {__VLS_StyleScopedClasses['value']} */ ;
        (plot.owner?.full_name || "Нет владельца");
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mobile-card-row" },
        });
        /** @type {__VLS_StyleScopedClasses['mobile-card-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "label" },
        });
        /** @type {__VLS_StyleScopedClasses['label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "value" },
        });
        /** @type {__VLS_StyleScopedClasses['value']} */ ;
        (plot.area_sqm);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mobile-card-row" },
        });
        /** @type {__VLS_StyleScopedClasses['mobile-card-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "label" },
        });
        /** @type {__VLS_StyleScopedClasses['label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "value connections" },
        });
        /** @type {__VLS_StyleScopedClasses['value']} */ ;
        /** @type {__VLS_StyleScopedClasses['connections']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "conn-badge" },
            ...{ class: ({ active: plot.has_electricity }) },
        });
        /** @type {__VLS_StyleScopedClasses['conn-badge']} */ ;
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-bolt" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-bolt']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "conn-badge" },
            ...{ class: ({ active: plot.has_water }) },
        });
        /** @type {__VLS_StyleScopedClasses['conn-badge']} */ ;
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-box" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-box']} */ ;
        if (__VLS_ctx.auth.isStaff) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: () => { } },
                ...{ class: "mobile-card-footer" },
            });
            /** @type {__VLS_StyleScopedClasses['mobile-card-footer']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.auth.isStaff))
                            return;
                        __VLS_ctx.openEditForm(plot);
                        // @ts-ignore
                        [auth, getBalanceClass, balances, balances, balances, formatMoney, openEditForm,];
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
                        if (!(__VLS_ctx.auth.isStaff))
                            return;
                        __VLS_ctx.confirmDelete(plot);
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
        }
        // @ts-ignore
        [];
    }
    if (__VLS_ctx.plots.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "empty-state" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-map" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-map']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        if (__VLS_ctx.auth.isStaff) {
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
    }
    if (__VLS_ctx.totalPages > 1) {
        const __VLS_15 = Pagination;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
            ...{ 'onChange': {} },
            currentPage: (__VLS_ctx.currentPage),
            totalPages: (__VLS_ctx.totalPages),
            totalItems: (__VLS_ctx.totalItems),
        }));
        const __VLS_17 = __VLS_16({
            ...{ 'onChange': {} },
            currentPage: (__VLS_ctx.currentPage),
            totalPages: (__VLS_ctx.totalPages),
            totalItems: (__VLS_ctx.totalItems),
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        let __VLS_20;
        const __VLS_21 = ({ change: {} },
            { onChange: (__VLS_ctx.changePage) });
        var __VLS_18;
        var __VLS_19;
    }
}
if (__VLS_ctx.showDetail && __VLS_ctx.selectedPlot) {
    let __VLS_22;
    /** @ts-ignore @type {typeof __VLS_components.PlotDetailModal} */
    PlotDetailModal;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
        ...{ 'onClose': {} },
        ...{ 'onEdit': {} },
        plot: (__VLS_ctx.selectedPlot),
        balance: (__VLS_ctx.balances.get(__VLS_ctx.selectedPlot.id)),
    }));
    const __VLS_24 = __VLS_23({
        ...{ 'onClose': {} },
        ...{ 'onEdit': {} },
        plot: (__VLS_ctx.selectedPlot),
        balance: (__VLS_ctx.balances.get(__VLS_ctx.selectedPlot.id)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    let __VLS_27;
    const __VLS_28 = ({ close: {} },
        { onClose: (...[$event]) => {
                if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedPlot))
                    return;
                __VLS_ctx.showDetail = false;
                // @ts-ignore
                [auth, openCreateForm, totalItems, plots, balances, totalPages, totalPages, currentPage, changePage, showDetail, showDetail, selectedPlot, selectedPlot, selectedPlot,];
            } });
    const __VLS_29 = ({ edit: {} },
        { onEdit: (...[$event]) => {
                if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedPlot))
                    return;
                __VLS_ctx.openEditForm(__VLS_ctx.selectedPlot);
                __VLS_ctx.showDetail = false;
                ;
                // @ts-ignore
                [openEditForm, showDetail, selectedPlot,];
            } });
    var __VLS_25;
    var __VLS_26;
}
if (__VLS_ctx.showForm) {
    const __VLS_30 = PlotFormModal;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        ...{ 'onClose': {} },
        ...{ 'onSave': {} },
        plot: (__VLS_ctx.editingPlot),
    }));
    const __VLS_32 = __VLS_31({
        ...{ 'onClose': {} },
        ...{ 'onSave': {} },
        plot: (__VLS_ctx.editingPlot),
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    let __VLS_35;
    const __VLS_36 = ({ close: {} },
        { onClose: (...[$event]) => {
                if (!(__VLS_ctx.showForm))
                    return;
                __VLS_ctx.showForm = false;
                // @ts-ignore
                [showForm, showForm, editingPlot,];
            } });
    const __VLS_37 = ({ save: {} },
        { onSave: (__VLS_ctx.handleSave) });
    var __VLS_33;
    var __VLS_34;
}
if (__VLS_ctx.showConfirm) {
    const __VLS_38 = ConfirmModal;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
        ...{ 'onClose': {} },
        ...{ 'onConfirm': {} },
        title: "Удалить участок?",
        message: (`Вы уверены, что хотите удалить участок ${__VLS_ctx.plotToDelete?.number}?`),
        confirmText: "Удалить",
        danger: true,
    }));
    const __VLS_40 = __VLS_39({
        ...{ 'onClose': {} },
        ...{ 'onConfirm': {} },
        title: "Удалить участок?",
        message: (`Вы уверены, что хотите удалить участок ${__VLS_ctx.plotToDelete?.number}?`),
        confirmText: "Удалить",
        danger: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    let __VLS_43;
    const __VLS_44 = ({ close: {} },
        { onClose: (...[$event]) => {
                if (!(__VLS_ctx.showConfirm))
                    return;
                __VLS_ctx.showConfirm = false;
                // @ts-ignore
                [handleSave, showConfirm, showConfirm, plotToDelete,];
            } });
    const __VLS_45 = ({ confirm: {} },
        { onConfirm: (__VLS_ctx.handleDelete) });
    var __VLS_41;
    var __VLS_42;
}
// @ts-ignore
[handleDelete,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
