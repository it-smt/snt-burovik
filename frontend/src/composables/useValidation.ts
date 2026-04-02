// src/composables/useValidation.ts

import { computed, ref } from "vue";

// Типы правил
type Rule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  email?: boolean;
  phone?: boolean;
  pattern?: RegExp;
  match?: { field: string; label: string };
  custom?: (value: any, allValues: Record<string, any>) => string | null;
  message?: string;
};

type FieldRules = Record<string, Rule>;

export function useValidation<T extends Record<string, any>>(
  formData: () => T,
  rules: FieldRules,
) {
  const errors = ref<Record<string, string>>({});
  const touched = ref<Set<string>>(new Set());

  const isValid = computed(() => {
    return Object.keys(errors.value).length === 0;
  });

  const hasErrors = computed(() => {
    return Object.keys(errors.value).length > 0;
  });

  function validateField(field: string): string | null {
    const rule = rules[field];
    if (!rule) return null;

    const values = formData();
    const value = values[field];

    // Required
    if (rule.required) {
      if (value === undefined || value === null || value === "") {
        return rule.message || "Обязательное поле";
      }
      if (typeof value === "string" && !value.trim()) {
        return rule.message || "Обязательное поле";
      }
    }

    // Пропускаем остальные проверки если пусто и не required
    if (value === undefined || value === null || value === "") {
      return null;
    }

    const strValue = String(value);

    // Min length
    if (rule.minLength && strValue.length < rule.minLength) {
      return rule.message || `Минимум ${rule.minLength} символов`;
    }

    // Max length
    if (rule.maxLength && strValue.length > rule.maxLength) {
      return rule.message || `Максимум ${rule.maxLength} символов`;
    }

    // Min number
    if (rule.min !== undefined && Number(value) < rule.min) {
      return rule.message || `Минимальное значение: ${rule.min}`;
    }

    // Max number
    if (rule.max !== undefined && Number(value) > rule.max) {
      return rule.message || `Максимальное значение: ${rule.max}`;
    }

    // Email
    if (rule.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(strValue)) {
        return rule.message || "Некорректный email";
      }
    }

    // Phone
    if (rule.phone) {
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,18}$/;
      if (!phoneRegex.test(strValue.replace(/\s/g, ""))) {
        return rule.message || "Некорректный телефон";
      }
    }

    // Pattern
    if (rule.pattern && !rule.pattern.test(strValue)) {
      return rule.message || "Некорректный формат";
    }

    // Match
    if (rule.match) {
      const matchValue = values[rule.match.field];
      if (value !== matchValue) {
        return rule.message || `Не совпадает с полем "${rule.match.label}"`;
      }
    }

    // Custom
    if (rule.custom) {
      return rule.custom(value, values);
    }

    return null;
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    for (const field of Object.keys(rules)) {
      const error = validateField(field);
      if (error) {
        newErrors[field] = error;
      }
    }

    errors.value = newErrors;
    // Помечаем все поля как touched
    touched.value = new Set(Object.keys(rules));

    return Object.keys(newErrors).length === 0;
  }

  function validateSingle(field: string) {
    touched.value.add(field);
    const error = validateField(field);

    if (error) {
      errors.value = { ...errors.value, [field]: error };
    } else {
      const newErrors = { ...errors.value };
      delete newErrors[field];
      errors.value = newErrors;
    }
  }

  function resetErrors() {
    errors.value = {};
    touched.value = new Set();
  }

  function getError(field: string): string | undefined {
    return touched.value.has(field) ? errors.value[field] : undefined;
  }

  function hasError(field: string): boolean {
    return touched.value.has(field) && !!errors.value[field];
  }

  return {
    errors,
    touched,
    isValid,
    hasErrors,
    validate,
    validateSingle,
    resetErrors,
    getError,
    hasError,
  };
}
