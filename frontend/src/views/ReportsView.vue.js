import { ref, onMounted } from "vue";
import { useAppToast } from "@/composables/useToast";
import { reportsApi, } from "@/api/reports";
import Skeleton from "@/components/common/Skeleton.vue";
import { exportToCSV, formatMoneyForExport } from "@/utils/export";
const toast = useAppToast();
const loading = ref(true);
const tab = ref("summary");
const summary = ref(null);
const debtors = ref([]);
const balances = ref([]);
const periods = ref([]);
async function load() {
    loading.value = true;
    try {
        const [s, d, b, p] = await Promise.all([
            reportsApi.getFinancialSummary(),
            reportsApi.getDebtors(),
            reportsApi.getAllBalances(),
            reportsApi.getPeriodSummaries(),
        ]);
        summary.value = s.data;
        debtors.value = d.data;
        balances.value = b.data;
        periods.value = p.data;
    }
    catch {
        toast.error("Не удалось загрузить отчёты");
    }
    finally {
        loading.value = false;
    }
}
onMounted(load);
function formatMoney(amount) {
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: 0,
    }).format(amount);
}
function formatPeriod(period) {
    const [year, month] = period.split("-");
    const months = [
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Декабрь",
    ];
    return `${months[parseInt(month) - 1]} ${year}`;
}
function getBalanceClass(balance) {
    if (balance < 0)
        return "debt";
    if (balance > 0)
        return "overpaid";
    return "zero";
}
function getCollectionClass(rate) {
    if (rate >= 90)
        return "good";
    if (rate >= 70)
        return "medium";
    return "bad";
}
// Экспорт
function exportDebtors() {
    const data = debtors.value.map((d) => ({
        Участок: d.plot_number,
        Владелец: d.owner_name,
        Телефон: d.owner_phone,
        Email: d.owner_email,
        Начислено: formatMoneyForExport(d.total_charged),
        Оплачено: formatMoneyForExport(d.total_paid),
        Долг: formatMoneyForExport(d.debt),
    }));
    exportToCSV(data, `должники_${new Date().toISOString().split("T")[0]}`);
    toast.success("Файл скачан");
}
function exportBalances() {
    const data = balances.value.map((b) => ({
        Участок: b.plot_number,
        Владелец: b.owner_name,
        Начислено: formatMoneyForExport(b.total_charged),
        Оплачено: formatMoneyForExport(b.total_paid),
        Баланс: formatMoneyForExport(b.balance),
    }));
    exportToCSV(data, `балансы_${new Date().toISOString().split("T")[0]}`);
    toast.success("Файл скачан");
}
function exportPeriods() {
    const data = periods.value.map((p) => ({
        Период: p.period,
        Начислено: formatMoneyForExport(p.total_charged),
        Оплачено: formatMoneyForExport(p.total_paid),
        Долг: formatMoneyForExport(p.total_debt),
        Участков: p.plots_count,
        Оплатили: p.paid_count,
        "Собираемость %": Math.round((p.total_paid / p.total_charged) * 100),
    }));
    exportToCSV(data, `периоды_${new Date().toISOString().split("T")[0]}`);
    toast.success("Файл скачан");
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "reports-page" },
});
/** @type {__VLS_StyleScopedClasses['reports-page']} */ ;
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
            __VLS_ctx.tab = 'summary';
            // @ts-ignore
            [tab,];
        } },
    ...{ class: (['tab', { active: __VLS_ctx.tab === 'summary' }]) },
});
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['tab']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "pi pi-chart-bar" },
});
/** @type {__VLS_StyleScopedClasses['pi']} */ ;
/** @type {__VLS_StyleScopedClasses['pi-chart-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.tab = 'debtors';
            // @ts-ignore
            [tab, tab,];
        } },
    ...{ class: (['tab', { active: __VLS_ctx.tab === 'debtors' }]) },
});
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['tab']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "pi pi-exclamation-triangle" },
});
/** @type {__VLS_StyleScopedClasses['pi']} */ ;
/** @type {__VLS_StyleScopedClasses['pi-exclamation-triangle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.tab = 'balances';
            // @ts-ignore
            [tab, tab,];
        } },
    ...{ class: (['tab', { active: __VLS_ctx.tab === 'balances' }]) },
});
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['tab']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "pi pi-wallet" },
});
/** @type {__VLS_StyleScopedClasses['pi']} */ ;
/** @type {__VLS_StyleScopedClasses['pi-wallet']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.tab = 'periods';
            // @ts-ignore
            [tab, tab,];
        } },
    ...{ class: (['tab', { active: __VLS_ctx.tab === 'periods' }]) },
});
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['tab']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "pi pi-calendar" },
});
/** @type {__VLS_StyleScopedClasses['pi']} */ ;
/** @type {__VLS_StyleScopedClasses['pi-calendar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
if (__VLS_ctx.loading) {
    const __VLS_0 = Skeleton;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        type: "stat",
        count: (4),
    }));
    const __VLS_2 = __VLS_1({
        type: "stat",
        count: (4),
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
    if (__VLS_ctx.tab === 'summary' && __VLS_ctx.summary) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "report-section" },
        });
        /** @type {__VLS_StyleScopedClasses['report-section']} */ ;
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
            ...{ class: "pi pi-map" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-map']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "stat-value" },
        });
        /** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
        (__VLS_ctx.summary.total_plots);
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
            ...{ class: "pi pi-users" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-users']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "stat-value" },
        });
        /** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
        (__VLS_ctx.summary.total_owners);
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
            ...{ class: "pi pi-file" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-file']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "stat-value" },
        });
        /** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
        (__VLS_ctx.formatMoney(__VLS_ctx.summary.total_charged));
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
        (__VLS_ctx.formatMoney(__VLS_ctx.summary.total_paid));
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
            ...{ class: "pi pi-exclamation-triangle" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-exclamation-triangle']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "stat-value" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
        (__VLS_ctx.formatMoney(__VLS_ctx.summary.total_debt));
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
            ...{ style: ({
                    background: __VLS_ctx.summary.collection_rate >= 90
                        ? '#dcfce7'
                        : __VLS_ctx.summary.collection_rate >= 70
                            ? '#fef3c7'
                            : '#fef2f2',
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-percentage" },
            ...{ style: ({
                    color: __VLS_ctx.summary.collection_rate >= 90
                        ? '#16a34a'
                        : __VLS_ctx.summary.collection_rate >= 70
                            ? '#d97706'
                            : '#dc2626',
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-percentage']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "stat-value" },
            ...{ class: (__VLS_ctx.getCollectionClass(__VLS_ctx.summary.collection_rate)) },
        });
        /** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
        (__VLS_ctx.summary.collection_rate);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "stat-label" },
        });
        /** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "collection-bar card" },
        });
        /** @type {__VLS_StyleScopedClasses['collection-bar']} */ ;
        /** @type {__VLS_StyleScopedClasses['card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "progress-container" },
        });
        /** @type {__VLS_StyleScopedClasses['progress-container']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "progress-bar" },
        });
        /** @type {__VLS_StyleScopedClasses['progress-bar']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "progress-fill" },
            ...{ style: ({ width: __VLS_ctx.summary.collection_rate + '%' }) },
            ...{ class: (__VLS_ctx.getCollectionClass(__VLS_ctx.summary.collection_rate)) },
        });
        /** @type {__VLS_StyleScopedClasses['progress-fill']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "progress-labels" },
        });
        /** @type {__VLS_StyleScopedClasses['progress-labels']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.formatMoney(__VLS_ctx.summary.total_paid));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.formatMoney(__VLS_ctx.summary.total_charged));
    }
    if (__VLS_ctx.tab === 'debtors') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "report-section" },
        });
        /** @type {__VLS_StyleScopedClasses['report-section']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "section-header" },
        });
        /** @type {__VLS_StyleScopedClasses['section-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-exclamation-triangle" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-exclamation-triangle']} */ ;
        (__VLS_ctx.debtors.length);
        if (__VLS_ctx.debtors.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_ctx.exportDebtors) },
                ...{ class: "btn btn-sm btn-secondary" },
            });
            /** @type {__VLS_StyleScopedClasses['btn']} */ ;
            /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
                ...{ class: "pi pi-download" },
            });
            /** @type {__VLS_StyleScopedClasses['pi']} */ ;
            /** @type {__VLS_StyleScopedClasses['pi-download']} */ ;
        }
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
        for (const [d] of __VLS_vFor((__VLS_ctx.debtors))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
                key: (d.plot_id),
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
            (d.plot_number);
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
            (d.owner_name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "contacts-cell" },
            });
            /** @type {__VLS_StyleScopedClasses['contacts-cell']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
                ...{ class: "pi pi-phone" },
            });
            /** @type {__VLS_StyleScopedClasses['pi']} */ ;
            /** @type {__VLS_StyleScopedClasses['pi-phone']} */ ;
            (d.owner_phone);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
                ...{ class: "pi pi-envelope" },
            });
            /** @type {__VLS_StyleScopedClasses['pi']} */ ;
            /** @type {__VLS_StyleScopedClasses['pi-envelope']} */ ;
            (d.owner_email);
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
            (__VLS_ctx.formatMoney(d.total_charged));
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
            (__VLS_ctx.formatMoney(d.total_paid));
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "debt-amount" },
            });
            /** @type {__VLS_StyleScopedClasses['debt-amount']} */ ;
            (__VLS_ctx.formatMoney(d.debt));
            // @ts-ignore
            [tab, tab, tab, loading, summary, summary, summary, summary, summary, summary, summary, summary, summary, summary, summary, summary, summary, summary, summary, summary, formatMoney, formatMoney, formatMoney, formatMoney, formatMoney, formatMoney, formatMoney, formatMoney, getCollectionClass, getCollectionClass, debtors, debtors, debtors, exportDebtors,];
        }
        if (!__VLS_ctx.debtors.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                colspan: "6",
                ...{ class: "empty-row" },
            });
            /** @type {__VLS_StyleScopedClasses['empty-row']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mobile-cards" },
        });
        /** @type {__VLS_StyleScopedClasses['mobile-cards']} */ ;
        for (const [d] of __VLS_vFor((__VLS_ctx.debtors))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (d.plot_id),
                ...{ class: "mobile-card debtor-card" },
            });
            /** @type {__VLS_StyleScopedClasses['mobile-card']} */ ;
            /** @type {__VLS_StyleScopedClasses['debtor-card']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mobile-card-header" },
            });
            /** @type {__VLS_StyleScopedClasses['mobile-card-header']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "mobile-card-title" },
            });
            /** @type {__VLS_StyleScopedClasses['mobile-card-title']} */ ;
            (d.plot_number);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "debt-badge" },
            });
            /** @type {__VLS_StyleScopedClasses['debt-badge']} */ ;
            (__VLS_ctx.formatMoney(d.debt));
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
            (d.owner_name);
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
            (d.owner_phone);
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
            (__VLS_ctx.formatMoney(d.total_charged));
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
            (__VLS_ctx.formatMoney(d.total_paid));
            // @ts-ignore
            [formatMoney, formatMoney, formatMoney, debtors, debtors,];
        }
        if (!__VLS_ctx.debtors.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "empty-state" },
            });
            /** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
                ...{ class: "pi pi-check-circle" },
            });
            /** @type {__VLS_StyleScopedClasses['pi']} */ ;
            /** @type {__VLS_StyleScopedClasses['pi-check-circle']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        }
        if (__VLS_ctx.debtors.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "total-row card" },
            });
            /** @type {__VLS_StyleScopedClasses['total-row']} */ ;
            /** @type {__VLS_StyleScopedClasses['card']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "debt-amount total" },
            });
            /** @type {__VLS_StyleScopedClasses['debt-amount']} */ ;
            /** @type {__VLS_StyleScopedClasses['total']} */ ;
            (__VLS_ctx.formatMoney(__VLS_ctx.debtors.reduce((sum, d) => sum + d.debt, 0)));
        }
    }
    if (__VLS_ctx.tab === 'balances') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "report-section" },
        });
        /** @type {__VLS_StyleScopedClasses['report-section']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "section-header" },
        });
        /** @type {__VLS_StyleScopedClasses['section-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-wallet" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-wallet']} */ ;
        if (__VLS_ctx.balances.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_ctx.exportBalances) },
                ...{ class: "btn btn-sm btn-secondary" },
            });
            /** @type {__VLS_StyleScopedClasses['btn']} */ ;
            /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
                ...{ class: "pi pi-download" },
            });
            /** @type {__VLS_StyleScopedClasses['pi']} */ ;
            /** @type {__VLS_StyleScopedClasses['pi-download']} */ ;
        }
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
        for (const [b] of __VLS_vFor((__VLS_ctx.balances))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
                key: (b.plot_id),
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
            (b.plot_number);
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
            (b.owner_name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
            (__VLS_ctx.formatMoney(b.total_charged));
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
            (__VLS_ctx.formatMoney(b.total_paid));
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "balance-cell" },
                ...{ class: (__VLS_ctx.getBalanceClass(b.balance)) },
            });
            /** @type {__VLS_StyleScopedClasses['balance-cell']} */ ;
            (b.balance < 0 ? "-" : "");
            (__VLS_ctx.formatMoney(Math.abs(b.balance)));
            // @ts-ignore
            [tab, formatMoney, formatMoney, formatMoney, formatMoney, debtors, debtors, debtors, balances, balances, exportBalances, getBalanceClass,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mobile-cards" },
        });
        /** @type {__VLS_StyleScopedClasses['mobile-cards']} */ ;
        for (const [b] of __VLS_vFor((__VLS_ctx.balances))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (b.plot_id),
                ...{ class: "mobile-card" },
            });
            /** @type {__VLS_StyleScopedClasses['mobile-card']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mobile-card-header" },
            });
            /** @type {__VLS_StyleScopedClasses['mobile-card-header']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "mobile-card-title" },
            });
            /** @type {__VLS_StyleScopedClasses['mobile-card-title']} */ ;
            (b.plot_number);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "balance-badge" },
                ...{ class: (__VLS_ctx.getBalanceClass(b.balance)) },
            });
            /** @type {__VLS_StyleScopedClasses['balance-badge']} */ ;
            (b.balance < 0 ? "-" : "");
            (__VLS_ctx.formatMoney(Math.abs(b.balance)));
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
            (b.owner_name);
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
            (__VLS_ctx.formatMoney(b.total_charged));
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
            (__VLS_ctx.formatMoney(b.total_paid));
            // @ts-ignore
            [formatMoney, formatMoney, formatMoney, balances, getBalanceClass,];
        }
    }
    if (__VLS_ctx.tab === 'periods') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "report-section" },
        });
        /** @type {__VLS_StyleScopedClasses['report-section']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "section-header" },
        });
        /** @type {__VLS_StyleScopedClasses['section-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-calendar" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-calendar']} */ ;
        if (__VLS_ctx.periods.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_ctx.exportPeriods) },
                ...{ class: "btn btn-sm btn-secondary" },
            });
            /** @type {__VLS_StyleScopedClasses['btn']} */ ;
            /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
                ...{ class: "pi pi-download" },
            });
            /** @type {__VLS_StyleScopedClasses['pi']} */ ;
            /** @type {__VLS_StyleScopedClasses['pi-download']} */ ;
        }
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
        for (const [p] of __VLS_vFor((__VLS_ctx.periods))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
                key: (p.period),
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
            (__VLS_ctx.formatPeriod(p.period));
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
            (__VLS_ctx.formatMoney(p.total_charged));
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ style: {} },
            });
            (__VLS_ctx.formatMoney(p.total_paid));
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
            if (p.total_debt > 0) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ style: {} },
                });
                (__VLS_ctx.formatMoney(p.total_debt));
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ style: {} },
                });
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
            (p.paid_count);
            (p.plots_count);
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mini-progress" },
            });
            /** @type {__VLS_StyleScopedClasses['mini-progress']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mini-progress-fill" },
                ...{ style: ({
                        width: (p.total_paid / p.total_charged) * 100 + '%',
                    }) },
                ...{ class: (__VLS_ctx.getCollectionClass((p.total_paid / p.total_charged) * 100)) },
            });
            /** @type {__VLS_StyleScopedClasses['mini-progress-fill']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "collection-rate" },
                ...{ class: (__VLS_ctx.getCollectionClass((p.total_paid / p.total_charged) * 100)) },
            });
            /** @type {__VLS_StyleScopedClasses['collection-rate']} */ ;
            (Math.round((p.total_paid / p.total_charged) * 100));
            // @ts-ignore
            [tab, formatMoney, formatMoney, formatMoney, getCollectionClass, getCollectionClass, periods, periods, exportPeriods, formatPeriod,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mobile-cards" },
        });
        /** @type {__VLS_StyleScopedClasses['mobile-cards']} */ ;
        for (const [p] of __VLS_vFor((__VLS_ctx.periods))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (p.period),
                ...{ class: "mobile-card period-card" },
            });
            /** @type {__VLS_StyleScopedClasses['mobile-card']} */ ;
            /** @type {__VLS_StyleScopedClasses['period-card']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mobile-card-header" },
            });
            /** @type {__VLS_StyleScopedClasses['mobile-card-header']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "mobile-card-title" },
            });
            /** @type {__VLS_StyleScopedClasses['mobile-card-title']} */ ;
            (__VLS_ctx.formatPeriod(p.period));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "collection-badge" },
                ...{ class: (__VLS_ctx.getCollectionClass((p.total_paid / p.total_charged) * 100)) },
            });
            /** @type {__VLS_StyleScopedClasses['collection-badge']} */ ;
            (Math.round((p.total_paid / p.total_charged) * 100));
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
            (__VLS_ctx.formatMoney(p.total_charged));
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
                ...{ style: {} },
            });
            /** @type {__VLS_StyleScopedClasses['value']} */ ;
            (__VLS_ctx.formatMoney(p.total_paid));
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
                ...{ style: ({
                        color: p.total_debt > 0 ? 'var(--danger)' : 'var(--success)',
                    }) },
            });
            /** @type {__VLS_StyleScopedClasses['value']} */ ;
            (p.total_debt > 0 ? __VLS_ctx.formatMoney(p.total_debt) : "—");
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
            (p.paid_count);
            (p.plots_count);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "period-progress" },
            });
            /** @type {__VLS_StyleScopedClasses['period-progress']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mini-progress" },
            });
            /** @type {__VLS_StyleScopedClasses['mini-progress']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mini-progress-fill" },
                ...{ style: ({
                        width: (p.total_paid / p.total_charged) * 100 + '%',
                    }) },
                ...{ class: (__VLS_ctx.getCollectionClass((p.total_paid / p.total_charged) * 100)) },
            });
            /** @type {__VLS_StyleScopedClasses['mini-progress-fill']} */ ;
            // @ts-ignore
            [formatMoney, formatMoney, formatMoney, getCollectionClass, getCollectionClass, periods, formatPeriod,];
        }
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
