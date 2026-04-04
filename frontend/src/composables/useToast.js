// src/composables/useToast.ts
import { useToast as usePrimeToast } from "primevue/usetoast";
export function useAppToast() {
    const toast = usePrimeToast();
    return {
        success(message, title = "Успешно") {
            toast.add({
                severity: "success",
                summary: title,
                detail: message,
                life: 3000,
            });
        },
        error(message, title = "Ошибка") {
            toast.add({
                severity: "error",
                summary: title,
                detail: message,
                life: 5000,
            });
        },
        warn(message, title = "Внимание") {
            toast.add({
                severity: "warn",
                summary: title,
                detail: message,
                life: 4000,
            });
        },
        info(message, title = "Информация") {
            toast.add({
                severity: "info",
                summary: title,
                detail: message,
                life: 3000,
            });
        },
    };
}
