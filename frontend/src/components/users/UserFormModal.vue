<!-- src/components/users/UserFormModal.vue -->

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useValidation } from "@/composables/useValidation";
import FormField from "@/components/common/FormField.vue";
import type { User, UserRole } from "@/types";
import type { CreateUserData, UpdateUserData } from "@/api/users";

const props = defineProps<{
  user: User | null;
}>();

const emit = defineEmits<{
  close: [];
  save: [data: CreateUserData | UpdateUserData];
}>();

const isEdit = computed(() => !!props.user);
const loading = ref(false);

const form = ref({
  email: "",
  full_name: "",
  phone: "",
  role: "owner" as UserRole,
  password: "",
  password_confirm: "",
});

// Валидация
const { validate, validateSingle, getError, hasError, resetErrors } =
  useValidation(() => form.value, {
    full_name: {
      required: true,
      minLength: 3,
      maxLength: 100,
      message: "Введите ФИО (минимум 3 символа)",
    },
    email: {
      required: true,
      email: true,
    },
    phone: {
      required: true,
      phone: true,
    },
    password: {
      required: !isEdit.value,
      minLength: 6,
      custom: (val) => {
        if (isEdit.value && !val) return null; // При редактировании пароль не обязателен
        if (val && val.length < 6) return "Минимум 6 символов";
        return null;
      },
    },
    password_confirm: {
      required: !isEdit.value,
      match: { field: "password", label: "Пароль" },
      custom: (val, all) => {
        if (isEdit.value && !all.password) return null;
        if (all.password && val !== all.password) return "Пароли не совпадают";
        return null;
      },
    },
  });

// Заполняем форму при редактировании
watch(
  () => props.user,
  (user) => {
    resetErrors();
    if (user) {
      form.value = {
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        password: "",
        password_confirm: "",
      };
    } else {
      form.value = {
        email: "",
        full_name: "",
        phone: "",
        role: "owner",
        password: "",
        password_confirm: "",
      };
    }
  },
  { immediate: true },
);

const roles: { value: UserRole; label: string }[] = [
  { value: "owner", label: "Собственник" },
  { value: "chairman", label: "Председатель" },
  { value: "accountant", label: "Бухгалтер" },
  { value: "admin", label: "Администратор" },
];

async function handleSubmit() {
  if (!validate()) return;

  loading.value = true;

  try {
    if (isEdit.value) {
      const data: UpdateUserData = {
        email: form.value.email,
        full_name: form.value.full_name,
        phone: form.value.phone,
        role: form.value.role,
      };
      emit("save", data);
    } else {
      const data: CreateUserData = {
        email: form.value.email,
        full_name: form.value.full_name,
        phone: form.value.phone,
        role: form.value.role,
        password: form.value.password,
      };
      emit("save", data);
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal user-form-modal">
      <div class="modal-header">
        <h3>{{ isEdit ? "Редактировать" : "Новый пользователь" }}</h3>
        <button class="close-btn" @click="emit('close')">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <FormField label="ФИО" :error="getError('full_name')" required>
          <input
            v-model="form.full_name"
            type="text"
            placeholder="Иванов Иван Иванович"
            @blur="validateSingle('full_name')"
          />
        </FormField>

        <FormField label="Email" :error="getError('email')" required>
          <input
            v-model="form.email"
            type="email"
            placeholder="mail@example.com"
            @blur="validateSingle('email')"
          />
        </FormField>

        <FormField label="Телефон" :error="getError('phone')" required>
          <input
            v-model="form.phone"
            type="tel"
            placeholder="+7 900 123-45-67"
            @blur="validateSingle('phone')"
          />
        </FormField>

        <FormField label="Роль" required>
          <select v-model="form.role">
            <option v-for="r in roles" :key="r.value" :value="r.value">
              {{ r.label }}
            </option>
          </select>
        </FormField>

        <template v-if="!isEdit">
          <div class="form-divider">
            <span>Данные для входа</span>
          </div>

          <FormField
            label="Пароль"
            :error="getError('password')"
            required
            hint="Минимум 6 символов"
          >
            <input
              v-model="form.password"
              type="password"
              placeholder="Введите пароль"
              @blur="validateSingle('password')"
            />
          </FormField>

          <FormField
            label="Подтверждение пароля"
            :error="getError('password_confirm')"
            required
          >
            <input
              v-model="form.password_confirm"
              type="password"
              placeholder="Повторите пароль"
              @blur="validateSingle('password_confirm')"
            />
          </FormField>
        </template>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="emit('close')"
          >
            Отмена
          </button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <i v-if="loading" class="pi pi-spinner pi-spin"></i>
            {{ isEdit ? "Сохранить" : "Создать" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss">
.user-form-modal {
  max-width: 500px;

  .form-divider {
    display: flex;
    align-items: center;
    margin: 24px 0 16px;

    span {
      padding: 0 12px;
      color: #64748b;
      font-size: 0.85rem;
      font-weight: 500;
      background: #fff;
    }

    &::before,
    &::after {
      content: "";
      flex: 1;
      height: 1px;
      background: #e2e8f0;
    }
  }

  .modal-footer {
    margin-top: 24px;
    padding: 0;
    border: none;
  }
}
</style>
