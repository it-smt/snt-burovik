import { ref, onMounted } from "vue";
import { activityApi } from "@/api/activity";
const logs = ref([]);
const loading = ref(true);
onMounted(async () => {
    try {
        const { data } = await activityApi.getRecent(10);
        logs.value = data;
    }
    finally {
        loading.value = false;
    }
});
function formatTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 60)
        return `${minutes} мин. назад`;
    if (hours < 24)
        return `${hours} ч. назад`;
    if (days < 7)
        return `${days} дн. назад`;
    return date.toLocaleDateString("ru-RU");
}
const actionLabels = {
    create: "создал",
    update: "изменил",
    delete: "удалил",
    verify: "подтвердил",
    respond: "ответил на",
};
const entityIcons = {
    user: "pi-user",
    plot: "pi-map",
    payment: "pi-wallet",
    charge: "pi-file",
    meter: "pi-gauge",
    announcement: "pi-megaphone",
    appeal: "pi-envelope",
};
const entityColors = {
    user: "#6366f1",
    plot: "#22c55e",
    payment: "#16a34a",
    charge: "#f59e0b",
    meter: "#06b6d4",
    announcement: "#8b5cf6",
    appeal: "#ec4899",
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "activity-feed card" },
});
/** @type {__VLS_StyleScopedClasses['activity-feed']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "activity-header" },
});
/** @type {__VLS_StyleScopedClasses['activity-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "pi pi-history" },
});
/** @type {__VLS_StyleScopedClasses['pi']} */ ;
/** @type {__VLS_StyleScopedClasses['pi-history']} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "activity-loading" },
    });
    /** @type {__VLS_StyleScopedClasses['activity-loading']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "pi pi-spinner pi-spin" },
    });
    /** @type {__VLS_StyleScopedClasses['pi']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-spinner']} */ ;
    /** @type {__VLS_StyleScopedClasses['pi-spin']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "activity-list" },
    });
    /** @type {__VLS_StyleScopedClasses['activity-list']} */ ;
    for (const [log] of __VLS_vFor((__VLS_ctx.logs))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (log.id),
            ...{ class: "activity-item" },
        });
        /** @type {__VLS_StyleScopedClasses['activity-item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "activity-icon" },
            ...{ style: ({
                    background: __VLS_ctx.entityColors[log.entity_type] + '20',
                    color: __VLS_ctx.entityColors[log.entity_type],
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['activity-icon']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: (['pi', __VLS_ctx.entityIcons[log.entity_type]]) },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "activity-content" },
        });
        /** @type {__VLS_StyleScopedClasses['activity-content']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "activity-text" },
        });
        /** @type {__VLS_StyleScopedClasses['activity-text']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (log.user_name);
        (__VLS_ctx.actionLabels[log.action] || log.action);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "activity-entity" },
        });
        /** @type {__VLS_StyleScopedClasses['activity-entity']} */ ;
        (log.entity_name.toLowerCase());
        if (log.details) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "activity-details" },
            });
            /** @type {__VLS_StyleScopedClasses['activity-details']} */ ;
            (log.details);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "activity-time" },
        });
        /** @type {__VLS_StyleScopedClasses['activity-time']} */ ;
        (__VLS_ctx.formatTime(log.created_at));
        // @ts-ignore
        [loading, logs, entityColors, entityColors, entityIcons, actionLabels, formatTime,];
    }
    if (!__VLS_ctx.logs.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "activity-empty" },
        });
        /** @type {__VLS_StyleScopedClasses['activity-empty']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "pi pi-inbox" },
        });
        /** @type {__VLS_StyleScopedClasses['pi']} */ ;
        /** @type {__VLS_StyleScopedClasses['pi-inbox']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
}
// @ts-ignore
[logs,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
