import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useAppToast } from "@/composables/useToast";
import { paymentsApi } from "@/api/payments";
import { plotsApi } from "@/api/plots";
import { tariffsApi } from "@/api/tariffs";
const auth = useAuthStore();
const toast = useAppToast();
const charges = ref([]);
const payments = ref([]);
const plots = ref([]);
const tariffs = ref([]);
const loading = ref(true);
const tab = ref("charges");
// Фильтры
const filterPlotId = ref("");
const filterPeriod = ref("");
// Формы
const showChargeForm = ref(false);
const showPaymentForm = ref(false);
const showMassChargeForm = ref(false);
const massChargeLoading = ref(false);
const chargeForm = ref({
    plot_id: 0,
    tariff_id: 0,
    period: "",
    amount: 0,
    description: "",
});
const paymentForm = ref({
    plot_id: 0,
    amount: 0,
    payment_date: "",
    payment_method: "cash",
    description: "",
});
const massChargeForm = ref({
    tariff_id: 0,
    period: "",
    description: "",
    amount_per_plot: 0,
    apply_to: "all",
    selected_plots: [],
});
// Фильтрованные данные
const filteredCharges = computed(() => {
    let data = [...charges.value];
    if (filterPlotId.value) {
        data = data.filter((c) => c.plot_id === filterPlotId.value);
    }
    if (filterPeriod.value) {
        data = data.filter((c) => c.period === filterPeriod.value);
    }
    return data;
});
const filteredPayments = computed(() => {
    let data = [...payments.value];
    if (filterPlotId.value) {
        data = data.filter((p) => p.plot_id === filterPlotId.value);
    }
    return data;
});
// Доступные периоды из данных
const availablePeriods = computed(() => {
    const periods = new Set(charges.value.map((c) => c.period));
    return [...periods].sort().reverse();
});
async function load() {
    loading.value = true;
    try {
        const ownerPlotFilter = auth.isOwner ? { plot_id: undefined } : {};
        const [c, p, pl, t] = await Promise.all([
            paymentsApi.getCharges(),
            paymentsApi.getPayments(),
            plotsApi.getAll(),
            tariffsApi.getAll(),
        ]);
        charges.value = c.data;
        payments.value = p.data;
        plots.value = pl.data.items;
        tariffs.value = t.data;
        // Для владельца фильтруем по его участкам
        if (auth.isOwner && auth.user) {
            const myPlotIds = plots.value
                .filter((p) => p.owner_id === auth.user.id)
                .map((p) => p.id);
            charges.value = charges.value.filter((c) => myPlotIds.includes(c.plot_id));
            payments.value = payments.value.filter((p) => myPlotIds.includes(p.plot_id));
        }
    }
    catch {
        toast.error("Не удалось загрузить данные");
    }
    finally {
        loading.value = false;
    }
}
onMounted(load);
function getPlotInfo(id) {
    const plot = plots.value.find((p) => p.id === id);
    return plot ? `${plot.number} (${plot.address})` : "—";
}
function getTariffName(id) {
    return tariffs.value.find((t) => t.id === id)?.name || "—";
}
function openChargeForm() {
    chargeForm.value = {
        plot_id: plots.value[0]?.id || 0,
        tariff_id: tariffs.value[0]?.id || 0,
        period: new Date().toISOString().slice(0, 7),
        amount: 0,
        description: "",
    };
    showChargeForm.value = true;
}
function openPaymentForm() {
    paymentForm.value = {
        plot_id: plots.value[0]?.id || 0,
        amount: 0,
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: "cash",
        description: "",
    };
    showPaymentForm.value = true;
}
function openMassChargeForm() {
    massChargeForm.value = {
        tariff_id: tariffs.value[0]?.id || 0,
        period: new Date().toISOString().slice(0, 7),
        description: "",
        amount_per_plot: 0,
        apply_to: "all",
        selected_plots: [],
    };
    showMassChargeForm.value = true;
}
async function saveCharge() {
    try {
        await paymentsApi.createCharge(chargeForm.value);
        showChargeForm.value = false;
        toast.success("Начисление создано");
        await load();
    }
    catch {
        toast.error("Не удалось создать начисление");
    }
}
async function savePayment() {
    try {
        await paymentsApi.createPayment({
            ...paymentForm.value,
        });
        showPaymentForm.value = false;
        toast.success("Оплата записана");
        await load();
    }
    catch {
        toast.error("Не удалось записать оплату");
    }
}
async function saveMassCharge() {
    massChargeLoading.value = true;
    try {
        const data = {
            tariff_id: massChargeForm.value.tariff_id,
            period: massChargeForm.value.period,
            description: massChargeForm.value.description,
            plot_ids: massChargeForm.value.apply_to === "all"
                ? []
                : massChargeForm.value.selected_plots,
            amount_per_plot: massChargeForm.value.amount_per_plot || undefined,
        };
        const { data: result } = await paymentsApi.createMassCharge(data);
        showMassChargeForm.value = false;
        if (result.skipped_count > 0) {
            toast.warn(`Создано ${result.created_count} начислений. Пропущено ${result.skipped_count} (уже существуют).`);
        }
        else {
            toast.success(`Создано ${result.created_count} начислений на ${formatMoney(result.total_amount)}`);
        }
        await load();
    }
    catch {
        toast.error("Не удалось создать массовые начисления");
    }
    finally {
        massChargeLoading.value = false;
    }
}
function clearFilters() {
    filterPlotId.value = "";
    filterPeriod.value = "";
}
function formatMoney(n) {
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: 0,
    }).format(n);
}
const methodLabels = {
    cash: "Наличные",
    card: "Карта",
    bank_transfer: "Перевод",
    qr: "QR/СБП",
};
// Участки с владельцем (для массового начисления)
const plotsWithOwner = computed(() => plots.value.filter((p) => p.owner_id));
function togglePlotSelection(plotId) {
    const idx = massChargeForm.value.selected_plots.indexOf(plotId);
    if (idx === -1) {
        massChargeForm.value.selected_plots.push(plotId);
    }
    else {
        massChargeForm.value.selected_plots.splice(idx, 1);
    }
}
function selectAllPlots() {
    massChargeForm.value.selected_plots = plotsWithOwner.value.map((p) => p.id);
}
function deselectAllPlots() {
    massChargeForm.value.selected_plots = [];
}
// Итого по фильтрованным данным
const chargesTotalAmount = computed(() => filteredCharges.value.reduce((sum, c) => sum + c.amount, 0));
const paymentsTotalAmount = computed(() => filteredPayments.value.reduce((sum, p) => sum + p.amount, 0));
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "page-title" },
});
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
if (__VLS_ctx.auth.isStaff) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "header-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.openMassChargeForm) },
        ...{ class: "btn btn-secondary" },
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-list" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-list']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "btn-text" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-text']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.openChargeForm) },
        ...{ class: "btn btn-secondary" },
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-plus" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-plus']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "btn-text" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-text']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.openPaymentForm) },
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
    ...{ class: "tabs" },
});
/** @type {__VLS_StyleScopedClasses['tabs']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.tab = 'charges';
            // @ts-ignore
            [auth, openMassChargeForm, openChargeForm, openPaymentForm, tab,];
        } },
    ...{ class: (['tab', { active: __VLS_ctx.tab === 'charges' }]) },
});
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['tab']} */ ;
(__VLS_ctx.filteredCharges.length);
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.tab = 'payments';
            // @ts-ignore
            [tab, tab, filteredCharges,];
        } },
    ...{ class: (['tab', { active: __VLS_ctx.tab === 'payments' }]) },
});
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['tab']} */ ;
(__VLS_ctx.filteredPayments.length);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "filters" },
});
/** @type {__VLS_StyleScopedClasses['filters']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    value: (__VLS_ctx.filterPlotId),
    ...{ class: "select" },
});
/** @type {__VLS_StyleScopedClasses['select']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "",
});
for (const [p] of __VLS_vFor((__VLS_ctx.plots))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        key: (p.id),
        value: (p.id),
    });
    (p.number);
    // @ts-ignore
    [tab, filteredPayments, filterPlotId, plots,];
}
if (__VLS_ctx.tab === 'charges') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.filterPeriod),
        ...{ class: "select" },
    });
    /** @type {__VLS_StyleScopedClasses['select']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "",
    });
    for (const [p] of __VLS_vFor((__VLS_ctx.availablePeriods))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (p),
            value: (p),
        });
        (p);
        // @ts-ignore
        [tab, filterPeriod, availablePeriods,];
    }
}
if (__VLS_ctx.filterPlotId || __VLS_ctx.filterPeriod) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.clearFilters) },
        ...{ class: "btn btn-sm btn-secondary" },
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-times" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-times']} */ ;
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
}
else if (__VLS_ctx.tab === 'charges') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    if (__VLS_ctx.filteredCharges.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "total-bar" },
        });
        /** @type {__VLS_StyleScopedClasses['total-bar']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "total-amount charges" },
        });
        /** @type {__VLS_StyleScopedClasses['total-amount']} */ ;
        /** @type {__VLS_StyleScopedClasses['charges']} */ ;
        (__VLS_ctx.formatMoney(__VLS_ctx.chargesTotalAmount));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "payments-list" },
    });
    /** @type {__VLS_StyleScopedClasses['payments-list']} */ ;
    for (const [c] of __VLS_vFor((__VLS_ctx.filteredCharges))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (c.id),
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
        (__VLS_ctx.getPlotInfo(c.plot_id));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "badge badge-warning" },
        });
        /** @type {__VLS_StyleScopedClasses['badge']} */ ;
        /** @type {__VLS_StyleScopedClasses['badge-warning']} */ ;
        (c.period);
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
        (__VLS_ctx.getTariffName(c.tariff_id));
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
        (__VLS_ctx.formatMoney(c.amount));
        if (c.description) {
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
            (c.description);
        }
        // @ts-ignore
        [tab, filteredCharges, filteredCharges, filterPlotId, filterPeriod, clearFilters, loading, formatMoney, formatMoney, chargesTotalAmount, getPlotInfo, getTariffName,];
    }
    if (!__VLS_ctx.filteredCharges.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "empty-state" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-file" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-file']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        if (__VLS_ctx.auth.isStaff && !__VLS_ctx.filterPlotId && !__VLS_ctx.filterPeriod) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_ctx.openMassChargeForm) },
                ...{ class: "btn btn-primary" },
                ...{ style: {} },
            });
            /** @type {__VLS_StyleScopedClasses['btn']} */ ;
            /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
                ...{ class: "pi pi-list" },
            });
            /** @type {__VLS_StyleScopedClasses['pi']} */ ;
            /** @type {__VLS_StyleScopedClasses['pi-list']} */ ;
        }
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    if (__VLS_ctx.filteredPayments.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "total-bar" },
        });
        /** @type {__VLS_StyleScopedClasses['total-bar']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "total-amount payments" },
        });
        /** @type {__VLS_StyleScopedClasses['total-amount']} */ ;
        /** @type {__VLS_StyleScopedClasses['payments']} */ ;
        (__VLS_ctx.formatMoney(__VLS_ctx.paymentsTotalAmount));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "payments-list" },
    });
    /** @type {__VLS_StyleScopedClasses['payments-list']} */ ;
    for (const [p] of __VLS_vFor((__VLS_ctx.filteredPayments))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (p.id),
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
        (__VLS_ctx.getPlotInfo(p.plot_id));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "badge badge-success" },
        });
        /** @type {__VLS_StyleScopedClasses['badge']} */ ;
        /** @type {__VLS_StyleScopedClasses['badge-success']} */ ;
        (p.payment_date);
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
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['value']} */ ;
        (__VLS_ctx.formatMoney(p.amount));
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
        (__VLS_ctx.methodLabels[p.payment_method]);
        if (p.description) {
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
            (p.description);
        }
        // @ts-ignore
        [auth, openMassChargeForm, filteredCharges, filteredPayments, filteredPayments, filterPlotId, filterPeriod, formatMoney, formatMoney, getPlotInfo, paymentsTotalAmount, methodLabels,];
    }
    if (!__VLS_ctx.filteredPayments.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "empty-state" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-wallet" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-wallet']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        if (__VLS_ctx.auth.isStaff && !__VLS_ctx.filterPlotId) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_ctx.openPaymentForm) },
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
}
if (__VLS_ctx.showChargeForm) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showChargeForm))
                    return;
                __VLS_ctx.showChargeForm = false;
                // @ts-ignore
                [auth, openPaymentForm, filteredPayments, filterPlotId, showChargeForm, showChargeForm,];
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
                if (!(__VLS_ctx.showChargeForm))
                    return;
                __VLS_ctx.showChargeForm = false;
                // @ts-ignore
                [showChargeForm,];
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
        ...{ onSubmit: (__VLS_ctx.saveCharge) },
        ...{ class: "modal-body" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.chargeForm.plot_id),
    });
    for (const [p] of __VLS_vFor((__VLS_ctx.plots))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (p.id),
            value: (p.id),
        });
        (p.number);
        // @ts-ignore
        [plots, saveCharge, chargeForm,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.chargeForm.tariff_id),
    });
    for (const [t] of __VLS_vFor((__VLS_ctx.tariffs))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (t.id),
            value: (t.id),
        });
        (t.name);
        // @ts-ignore
        [chargeForm, tariffs,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "month",
    });
    (__VLS_ctx.chargeForm.period);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
    });
    (__VLS_ctx.chargeForm.amount);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({});
    (__VLS_ctx.chargeForm.description);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showChargeForm))
                    return;
                __VLS_ctx.showChargeForm = false;
                // @ts-ignore
                [showChargeForm, chargeForm, chargeForm, chargeForm,];
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
if (__VLS_ctx.showPaymentForm) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showPaymentForm))
                    return;
                __VLS_ctx.showPaymentForm = false;
                // @ts-ignore
                [showPaymentForm, showPaymentForm,];
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
                if (!(__VLS_ctx.showPaymentForm))
                    return;
                __VLS_ctx.showPaymentForm = false;
                // @ts-ignore
                [showPaymentForm,];
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
        ...{ onSubmit: (__VLS_ctx.savePayment) },
        ...{ class: "modal-body" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.paymentForm.plot_id),
    });
    for (const [p] of __VLS_vFor((__VLS_ctx.plots))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (p.id),
            value: (p.id),
        });
        (p.number);
        // @ts-ignore
        [plots, savePayment, paymentForm,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
    });
    (__VLS_ctx.paymentForm.amount);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "date",
    });
    (__VLS_ctx.paymentForm.payment_date);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.paymentForm.payment_method),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "cash",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "card",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "bank_transfer",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "qr",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({});
    (__VLS_ctx.paymentForm.description);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showPaymentForm))
                    return;
                __VLS_ctx.showPaymentForm = false;
                // @ts-ignore
                [showPaymentForm, paymentForm, paymentForm, paymentForm, paymentForm,];
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
if (__VLS_ctx.showMassChargeForm) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showMassChargeForm))
                    return;
                __VLS_ctx.showMassChargeForm = false;
                // @ts-ignore
                [showMassChargeForm, showMassChargeForm,];
            } },
        ...{ class: "modal-overlay" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal mass-charge-modal" },
    });
    /** @type {__VLS_StyleScopedClasses['modal']} */ ;
    /** @type {__VLS_StyleScopedClasses['mass-charge-modal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-header" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showMassChargeForm))
                    return;
                __VLS_ctx.showMassChargeForm = false;
                // @ts-ignore
                [showMassChargeForm,];
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
        ...{ onSubmit: (__VLS_ctx.saveMassCharge) },
        ...{ class: "modal-body" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mass-charge-info" },
    });
    /** @type {__VLS_StyleScopedClasses['mass-charge-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-info-circle" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-info-circle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.massChargeForm.tariff_id),
    });
    for (const [t] of __VLS_vFor((__VLS_ctx.tariffs))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (t.id),
            value: (t.id),
        });
        (t.name);
        (t.rate);
        (t.unit);
        // @ts-ignore
        [tariffs, saveMassCharge, massChargeForm,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "month",
        required: true,
    });
    (__VLS_ctx.massChargeForm.period);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "0",
        step: "0.01",
        placeholder: "0 = рассчитать по тарифу",
    });
    (__VLS_ctx.massChargeForm.amount_per_plot);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "hint-text" },
    });
    /** @type {__VLS_StyleScopedClasses['hint-text']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        placeholder: "Членский взнос за январь 2025",
    });
    (__VLS_ctx.massChargeForm.description);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "apply-to-selector" },
    });
    /** @type {__VLS_StyleScopedClasses['apply-to-selector']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "radio-label" },
    });
    /** @type {__VLS_StyleScopedClasses['radio-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "radio",
        value: "all",
    });
    (__VLS_ctx.massChargeForm.apply_to);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.plotsWithOwner.length);
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "radio-label" },
    });
    /** @type {__VLS_StyleScopedClasses['radio-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "radio",
        value: "selected",
    });
    (__VLS_ctx.massChargeForm.apply_to);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    if (__VLS_ctx.massChargeForm.apply_to === 'selected') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plots-selector" },
        });
        /** @type {__VLS_StyleScopedClasses['plots-selector']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plots-selector-actions" },
        });
        /** @type {__VLS_StyleScopedClasses['plots-selector-actions']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.selectAllPlots) },
            type: "button",
            ...{ class: "btn btn-sm btn-secondary" },
        });
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.deselectAllPlots) },
            type: "button",
            ...{ class: "btn btn-sm btn-secondary" },
        });
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "selected-count" },
        });
        /** @type {__VLS_StyleScopedClasses['selected-count']} */ ;
        (__VLS_ctx.massChargeForm.selected_plots.length);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plots-checkbox-list" },
        });
        /** @type {__VLS_StyleScopedClasses['plots-checkbox-list']} */ ;
        for (const [p] of __VLS_vFor((__VLS_ctx.plotsWithOwner))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
                key: (p.id),
                ...{ class: "plot-checkbox" },
                ...{ class: ({
                        checked: __VLS_ctx.massChargeForm.selected_plots.includes(p.id),
                    }) },
            });
            /** @type {__VLS_StyleScopedClasses['plot-checkbox']} */ ;
            /** @type {__VLS_StyleScopedClasses['checked']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                ...{ onChange: (...[$event]) => {
                        if (!(__VLS_ctx.showMassChargeForm))
                            return;
                        if (!(__VLS_ctx.massChargeForm.apply_to === 'selected'))
                            return;
                        __VLS_ctx.togglePlotSelection(p.id);
                        // @ts-ignore
                        [massChargeForm, massChargeForm, massChargeForm, massChargeForm, massChargeForm, massChargeForm, massChargeForm, massChargeForm, plotsWithOwner, plotsWithOwner, selectAllPlots, deselectAllPlots, togglePlotSelection,];
                    } },
                type: "checkbox",
                checked: (__VLS_ctx.massChargeForm.selected_plots.includes(p.id)),
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "plot-checkbox-info" },
            });
            /** @type {__VLS_StyleScopedClasses['plot-checkbox-info']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
            (p.number);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (p.owner?.full_name || "—");
            // @ts-ignore
            [massChargeForm,];
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showMassChargeForm))
                    return;
                __VLS_ctx.showMassChargeForm = false;
                // @ts-ignore
                [showMassChargeForm,];
            } },
        type: "button",
        ...{ class: "btn btn-secondary" },
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        type: "submit",
        ...{ class: "btn btn-primary" },
        disabled: (__VLS_ctx.massChargeLoading),
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: (__VLS_ctx.massChargeLoading ? 'pi pi-spinner pi-spin' : 'pi pi-check') },
    });
}
// @ts-ignore
[massChargeLoading, massChargeLoading,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
