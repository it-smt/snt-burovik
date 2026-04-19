import { ref, onMounted } from "vue";
import { paymentsApi } from "@/api/payments";
import { metersApi } from "@/api/meters";
const props = defineProps();
const emit = defineEmits();
const tab = ref("info");
const charges = ref([]);
const payments = ref([]);
const readings = ref([]);
const loading = ref(true);
onMounted(async () => {
    try {
        const [c, p, r] = await Promise.all([
            paymentsApi.getCharges({ plot_id: props.plot.id }),
            paymentsApi.getPayments({ plot_id: props.plot.id }),
            metersApi.getReadings({ plot_id: props.plot.id }),
        ]);
        charges.value = c.data;
        payments.value = p.data;
        readings.value = r.data;
    }
    finally {
        loading.value = false;
    }
});
function formatMoney(n) {
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: 0,
    }).format(n);
}
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("ru-RU");
}
const meterTypeLabels = {
    electricity: "Электричество",
    water_cold: "Холодная вода",
    water_hot: "Горячая вода",
};
const paymentMethodLabels = {
    cash: "Наличные",
    card: "Карта",
    bank_transfer: "Перевод",
    qr: "QR/СБП",
};
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
    ...{ class: "modal plot-detail-modal" },
});
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['plot-detail-modal']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "modal-header" },
});
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
(__VLS_ctx.plot.number);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "plot-address-sub" },
});
/** @type {__VLS_StyleScopedClasses['plot-address-sub']} */ ;
(__VLS_ctx.plot.address);
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.emit('close');
            // @ts-ignore
            [emit, plot, plot,];
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
    ...{ class: "detail-tabs" },
});
/** @type {__VLS_StyleScopedClasses['detail-tabs']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.tab = 'info';
            // @ts-ignore
            [tab,];
        } },
    ...{ class: (['detail-tab', { active: __VLS_ctx.tab === 'info' }]) },
});
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-tab']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "pi pi-info-circle" },
});
/** @type {__VLS_StyleScopedClasses['pi']} */ ;
/** @type {__VLS_StyleScopedClasses['pi-info-circle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.tab = 'payments';
            // @ts-ignore
            [tab, tab,];
        } },
    ...{ class: (['detail-tab', { active: __VLS_ctx.tab === 'payments' }]) },
});
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-tab']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "pi pi-wallet" },
});
/** @type {__VLS_StyleScopedClasses['pi']} */ ;
/** @type {__VLS_StyleScopedClasses['pi-wallet']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.tab = 'meters';
            // @ts-ignore
            [tab, tab,];
        } },
    ...{ class: (['detail-tab', { active: __VLS_ctx.tab === 'meters' }]) },
});
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-tab']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "pi pi-gauge" },
});
/** @type {__VLS_StyleScopedClasses['pi']} */ ;
/** @type {__VLS_StyleScopedClasses['pi-gauge']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "modal-body" },
});
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
if (__VLS_ctx.tab === 'info') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-content" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "balance-card" },
        ...{ class: ({
                debt: (__VLS_ctx.balance?.balance ?? 0) < 0,
                overpaid: (__VLS_ctx.balance?.balance ?? 0) > 0,
            }) },
    });
    /** @type {__VLS_StyleScopedClasses['balance-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['debt']} */ ;
    /** @type {__VLS_StyleScopedClasses['overpaid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "balance-label" },
    });
    /** @type {__VLS_StyleScopedClasses['balance-label']} */ ;
    ((__VLS_ctx.balance?.balance ?? 0) < 0 ? "Задолженность" : "Баланс");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "balance-value" },
    });
    /** @type {__VLS_StyleScopedClasses['balance-value']} */ ;
    ((__VLS_ctx.balance?.balance ?? 0) < 0 ? "-" : "");
    (__VLS_ctx.formatMoney(Math.abs(__VLS_ctx.balance?.balance ?? 0)));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "balance-details" },
    });
    /** @type {__VLS_StyleScopedClasses['balance-details']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.formatMoney(__VLS_ctx.balance?.total_charged ?? 0));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.formatMoney(__VLS_ctx.balance?.total_paid ?? 0));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-section" },
    });
    /** @type {__VLS_StyleScopedClasses['info-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['info-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-item" },
    });
    /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    (__VLS_ctx.plot.area_sqm);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-item" },
    });
    /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    (__VLS_ctx.plot.cadastral_number || "—");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-item" },
    });
    /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: (__VLS_ctx.plot.has_electricity
                ? 'pi pi-check-circle'
                : 'pi pi-times-circle') },
        ...{ style: ({
                color: __VLS_ctx.plot.has_electricity ? '#16a34a' : '#dc2626',
            }) },
    });
    (__VLS_ctx.plot.has_electricity ? "Подключено" : "Нет");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-item" },
    });
    /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: (__VLS_ctx.plot.has_water
                ? 'pi pi-check-circle'
                : 'pi pi-times-circle') },
        ...{ style: ({ color: __VLS_ctx.plot.has_water ? '#16a34a' : '#dc2626' }) },
    });
    (__VLS_ctx.plot.has_water ? "Подключено" : "Нет");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-section" },
    });
    /** @type {__VLS_StyleScopedClasses['info-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    if (__VLS_ctx.plot.owner) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "owner-info" },
        });
        /** @type {__VLS_StyleScopedClasses['owner-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "owner-avatar" },
        });
        /** @type {__VLS_StyleScopedClasses['owner-avatar']} */ ;
        (__VLS_ctx.plot.owner.full_name.charAt(0));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "owner-details" },
        });
        /** @type {__VLS_StyleScopedClasses['owner-details']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "owner-name" },
        });
        /** @type {__VLS_StyleScopedClasses['owner-name']} */ ;
        (__VLS_ctx.plot.owner.full_name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "owner-contacts" },
        });
        /** @type {__VLS_StyleScopedClasses['owner-contacts']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-phone" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-phone']} */ ;
        (__VLS_ctx.plot.owner.phone);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "no-owner-info" },
        });
        /** @type {__VLS_StyleScopedClasses['no-owner-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-user-minus" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-user-minus']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
}
else if (__VLS_ctx.tab === 'payments') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-content" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-content']} */ ;
    if (__VLS_ctx.loading) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "loading-small" },
        });
        /** @type {__VLS_StyleScopedClasses['loading-small']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-spinner pi-spin" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-spinner']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-spin']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "payments-section" },
        });
        /** @type {__VLS_StyleScopedClasses['payments-section']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
        (__VLS_ctx.charges.length);
        if (__VLS_ctx.charges.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mini-list" },
            });
            /** @type {__VLS_StyleScopedClasses['mini-list']} */ ;
            for (const [c] of __VLS_vFor((__VLS_ctx.charges))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (c.id),
                    ...{ class: "mini-item" },
                });
                /** @type {__VLS_StyleScopedClasses['mini-item']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "mini-item-main" },
                });
                /** @type {__VLS_StyleScopedClasses['mini-item-main']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "mini-item-title" },
                });
                /** @type {__VLS_StyleScopedClasses['mini-item-title']} */ ;
                (c.description || "Начисление");
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "mini-item-date" },
                });
                /** @type {__VLS_StyleScopedClasses['mini-item-date']} */ ;
                (c.period);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "mini-item-amount charges" },
                });
                /** @type {__VLS_StyleScopedClasses['mini-item-amount']} */ ;
                /** @type {__VLS_StyleScopedClasses['charges']} */ ;
                (__VLS_ctx.formatMoney(c.amount));
                // @ts-ignore
                [plot, plot, plot, plot, plot, plot, plot, plot, plot, plot, plot, plot, tab, tab, tab, balance, balance, balance, balance, balance, balance, balance, formatMoney, formatMoney, formatMoney, formatMoney, loading, charges, charges, charges,];
            }
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mini-empty" },
            });
            /** @type {__VLS_StyleScopedClasses['mini-empty']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "payments-section" },
        });
        /** @type {__VLS_StyleScopedClasses['payments-section']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
        (__VLS_ctx.payments.length);
        if (__VLS_ctx.payments.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mini-list" },
            });
            /** @type {__VLS_StyleScopedClasses['mini-list']} */ ;
            for (const [p] of __VLS_vFor((__VLS_ctx.payments))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (p.id),
                    ...{ class: "mini-item" },
                });
                /** @type {__VLS_StyleScopedClasses['mini-item']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "mini-item-main" },
                });
                /** @type {__VLS_StyleScopedClasses['mini-item-main']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "mini-item-title" },
                });
                /** @type {__VLS_StyleScopedClasses['mini-item-title']} */ ;
                (__VLS_ctx.paymentMethodLabels[p.payment_method]);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "mini-item-date" },
                });
                /** @type {__VLS_StyleScopedClasses['mini-item-date']} */ ;
                (__VLS_ctx.formatDate(p.payment_date));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "mini-item-amount payments" },
                });
                /** @type {__VLS_StyleScopedClasses['mini-item-amount']} */ ;
                /** @type {__VLS_StyleScopedClasses['payments']} */ ;
                (__VLS_ctx.formatMoney(p.amount));
                // @ts-ignore
                [formatMoney, payments, payments, payments, paymentMethodLabels, formatDate,];
            }
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mini-empty" },
            });
            /** @type {__VLS_StyleScopedClasses['mini-empty']} */ ;
        }
    }
}
else if (__VLS_ctx.tab === 'meters') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-content" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-content']} */ ;
    if (__VLS_ctx.loading) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "loading-small" },
        });
        /** @type {__VLS_StyleScopedClasses['loading-small']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-spinner pi-spin" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-spinner']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-spin']} */ ;
    }
    else {
        if (__VLS_ctx.readings.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mini-list" },
            });
            /** @type {__VLS_StyleScopedClasses['mini-list']} */ ;
            for (const [r] of __VLS_vFor((__VLS_ctx.readings))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (r.id),
                    ...{ class: "mini-item" },
                });
                /** @type {__VLS_StyleScopedClasses['mini-item']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "mini-item-main" },
                });
                /** @type {__VLS_StyleScopedClasses['mini-item-main']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "mini-item-title" },
                });
                /** @type {__VLS_StyleScopedClasses['mini-item-title']} */ ;
                (__VLS_ctx.meterTypeLabels[r.meter_type]);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "mini-item-date" },
                });
                /** @type {__VLS_StyleScopedClasses['mini-item-date']} */ ;
                (__VLS_ctx.formatDate(r.reading_date));
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "mini-item-right" },
                });
                /** @type {__VLS_StyleScopedClasses['mini-item-right']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "meter-value" },
                });
                /** @type {__VLS_StyleScopedClasses['meter-value']} */ ;
                (r.value);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: ([
                            'badge badge-sm',
                            r.is_verified ? 'badge-success' : 'badge-warning',
                        ]) },
                });
                /** @type {__VLS_StyleScopedClasses['badge']} */ ;
                /** @type {__VLS_StyleScopedClasses['badge-sm']} */ ;
                (r.is_verified ? "✓" : "?");
                // @ts-ignore
                [tab, loading, formatDate, readings, readings, meterTypeLabels,];
            }
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mini-empty" },
            });
            /** @type {__VLS_StyleScopedClasses['mini-empty']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
                ...{ class: "pi pi-gauge" },
            });
            /** @type {__VLS_StyleScopedClasses['pi']} */ ;
            /** @type {__VLS_StyleScopedClasses['pi-gauge']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        }
    }
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
    ...{ class: "btn btn-secondary" },
});
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.emit('edit');
            // @ts-ignore
            [emit,];
        } },
    ...{ class: "btn btn-primary" },
});
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "pi pi-pencil" },
});
/** @type {__VLS_StyleScopedClasses['pi']} */ ;
/** @type {__VLS_StyleScopedClasses['pi-pencil']} */ ;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
