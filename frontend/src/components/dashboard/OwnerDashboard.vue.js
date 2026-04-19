import { ref, onMounted } from "vue";
import { plotsApi } from "@/api/plots";
import { announcementsApi } from "@/api/announcements";
import ActivityFeed from "./ActivityFeed.vue";
const plots = ref([]);
const balances = ref(new Map());
const announcements = ref([]);
const loading = ref(true);
onMounted(async () => {
    try {
        const [plotsRes, annRes] = await Promise.all([
            plotsApi.getMyPlots(),
            announcementsApi.getAll({ page: 1 }),
        ]);
        plots.value = plotsRes.data;
        announcements.value = annRes.data.items.slice(0, 5);
        // Загружаем баланс по каждому участку
        for (const plot of plots.value) {
            const balRes = await plotsApi.getBalance(plot.id);
            balances.value.set(plot.id, balRes.data);
        }
    }
    finally {
        loading.value = false;
    }
});
function formatMoney(amount) {
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: 0,
    }).format(amount);
}
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("ru-RU");
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "loading" },
    });
    /** @type {__VLS_StyleScopedClasses['loading']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-spinner pi-spin" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-spinner']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-spin']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "owner-dashboard" },
    });
    /** @type {__VLS_StyleScopedClasses['owner-dashboard']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "section" },
    });
    /** @type {__VLS_StyleScopedClasses['section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-map" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-map']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cards-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['cards-grid']} */ ;
    for (const [plot] of __VLS_vFor((__VLS_ctx.plots))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (plot.id),
            ...{ class: "plot-card" },
        });
        /** @type {__VLS_StyleScopedClasses['plot-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plot-header" },
        });
        /** @type {__VLS_StyleScopedClasses['plot-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "plot-number" },
        });
        /** @type {__VLS_StyleScopedClasses['plot-number']} */ ;
        (plot.number);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "plot-area" },
        });
        /** @type {__VLS_StyleScopedClasses['plot-area']} */ ;
        (plot.area_sqm);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plot-details" },
        });
        /** @type {__VLS_StyleScopedClasses['plot-details']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail" },
        });
        /** @type {__VLS_StyleScopedClasses['detail']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-bolt" },
            ...{ class: ({ active: plot.has_electricity }) },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-bolt']} */ ;
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail" },
        });
        /** @type {__VLS_StyleScopedClasses['detail']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-database" },
            ...{ class: ({ active: plot.has_water }) },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-database']} */ ;
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plot-balance" },
            ...{ class: ({
                    debt: (__VLS_ctx.balances.get(plot.id)?.balance ?? 0) < 0,
                    paid: (__VLS_ctx.balances.get(plot.id)?.balance ?? 0) >= 0,
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['plot-balance']} */ ;
        /** @type {__VLS_StyleScopedClasses['debt']} */ ;
        /** @type {__VLS_StyleScopedClasses['paid']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "balance-label" },
        });
        /** @type {__VLS_StyleScopedClasses['balance-label']} */ ;
        ((__VLS_ctx.balances.get(plot.id)?.balance ?? 0) < 0
            ? "Задолженность"
            : "Баланс");
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "balance-value" },
        });
        /** @type {__VLS_StyleScopedClasses['balance-value']} */ ;
        (__VLS_ctx.formatMoney(Math.abs(__VLS_ctx.balances.get(plot.id)?.balance ?? 0)));
        // @ts-ignore
        [loading, plots, balances, balances, balances, balances, formatMoney,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "section" },
    });
    /** @type {__VLS_StyleScopedClasses['section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-bolt" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-bolt']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "actions-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['actions-grid']} */ ;
    let __VLS_0;
    /** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
    RouterLink;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        to: "/meters",
        ...{ class: "action-card" },
    }));
    const __VLS_2 = __VLS_1({
        to: "/meters",
        ...{ class: "action-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['action-card']} */ ;
    const { default: __VLS_5 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-gauge" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-gauge']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_3;
    let __VLS_6;
    /** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
    RouterLink;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        to: "/payments",
        ...{ class: "action-card" },
    }));
    const __VLS_8 = __VLS_7({
        to: "/payments",
        ...{ class: "action-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    /** @type {__VLS_StyleScopedClasses['action-card']} */ ;
    const { default: __VLS_11 } = __VLS_9.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-wallet" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-wallet']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_9;
    let __VLS_12;
    /** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
    RouterLink;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
        to: "/appeals",
        ...{ class: "action-card" },
    }));
    const __VLS_14 = __VLS_13({
        to: "/appeals",
        ...{ class: "action-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    /** @type {__VLS_StyleScopedClasses['action-card']} */ ;
    const { default: __VLS_17 } = __VLS_15.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-envelope" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-envelope']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_15;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "section" },
    });
    /** @type {__VLS_StyleScopedClasses['section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-megaphone" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-megaphone']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "announcements-list" },
    });
    /** @type {__VLS_StyleScopedClasses['announcements-list']} */ ;
    for (const [ann] of __VLS_vFor((__VLS_ctx.announcements))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (ann.id),
            ...{ class: "announcement-item" },
            ...{ class: ({ important: ann.is_important }) },
        });
        /** @type {__VLS_StyleScopedClasses['announcement-item']} */ ;
        /** @type {__VLS_StyleScopedClasses['important']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ann-header" },
        });
        /** @type {__VLS_StyleScopedClasses['ann-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "ann-title" },
        });
        /** @type {__VLS_StyleScopedClasses['ann-title']} */ ;
        (ann.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "ann-date" },
        });
        /** @type {__VLS_StyleScopedClasses['ann-date']} */ ;
        (__VLS_ctx.formatDate(ann.published_at));
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "ann-content" },
        });
        /** @type {__VLS_StyleScopedClasses['ann-content']} */ ;
        (ann.content);
        if (ann.is_important) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "important-badge" },
            });
            /** @type {__VLS_StyleScopedClasses['important-badge']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
                ...{ class: "pi pi-exclamation-triangle" },
            });
            /** @type {__VLS_StyleScopedClasses['pi']} */ ;
            /** @type {__VLS_StyleScopedClasses['pi-exclamation-triangle']} */ ;
        }
        // @ts-ignore
        [announcements, formatDate,];
    }
    if (__VLS_ctx.announcements.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "empty" },
        });
        /** @type {__VLS_StyleScopedClasses['empty']} */ ;
    }
    const __VLS_18 = ActivityFeed;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({}));
    const __VLS_20 = __VLS_19({}, ...__VLS_functionalComponentArgsRest(__VLS_19));
}
// @ts-ignore
[announcements,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
