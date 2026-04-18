<!-- src/components/plots/PlotFormModal.vue -->

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useValidation } from "@/composables/useValidation";
import FormField from "@/components/common/FormField.vue";
import {
  plotsApi,
  type CreatePlotData,
  type UpdatePlotData,
} from "@/api/plots";
import type { Plot } from "@/types";

const props = defineProps<{
  plot: Plot | null;
}>();

const emit = defineEmits<{
  close: [];
  save: [data: CreatePlotData | UpdatePlotData];
}>();

const isEdit = computed(() => !!props.plot);
const loading = ref(false);

const form = ref({
  number: "",
  area_sqm: 600,
  cadastral_number: "",
  address: "",
  owner_id: null as number | null,
  has_electricity: false,
  has_water: false,
});

const owners = ref<{ id: number; full_name: string }[]>([]);

const { validate, validateSingle, getError, resetErrors } = useValidation(
  () => form.value,
  {
    number: {
      required: true,
      maxLength: 20,
      pattern: /^[А-Яа-яA-Za-z0-9\-]+$/,
      message: "Введите номер (буквы, цифры, дефис)",
    },
    area_sqm: {
      required: true,
      min: 1,
      max: 100000,
      message: "Введите корректную площадь (1–100000 м²)",
    },
    address: {
      required: true,
      minLength: 3,
      maxLength: 200,
      message: "Введите адрес (минимум 3 символа)",
    },
    cadastral_number: {
      pattern: /^(\d{2}:\d{2}:\d{6,7}:\d+)?$/,
      message: "Формат: 50:26:0180505:123",
    },
  },
);

onMounted(async () => {
  const { data } = await plotsApi.getOwnersList();
  owners.value = data;
});

watch(
  () => props.plot,
  (plot) => {
    resetErrors();
    if (plot) {
      form.value = {
        number: plot.number,
        area_sqm: plot.area_sqm,
        cadastral_number: plot.cadastral_number || "",
        address: plot.address,
        owner_id: plot.owner_id,
        has_electricity: plot.has_electricity,
        has_water: plot.has_water,
      };
    } else {
      form.value = {
        number: "",
        area_sqm: 600,
        cadastral_number: "",
        address: "",
        owner_id: null,
        has_electricity: false,
        has_water: false,
      };
    }
  },
  { immediate: true },
);

async function handleSubmit() {
  if (!validate()) return;

  loading.value = true;

  try {
    const data: CreatePlotData = {
      number: form.value.number.trim(),
      area_sqm: Number(form.value.area_sqm),
      cadastral_number: form.value.cadastral_number.trim() || undefined,
      address: form.value.address.trim(),
      owner_id: form.value.owner_id,
      has_electricity: form.value.has_electricity,
      has_water: form.value.has_water,
    };
    emit("save", data);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal plot-form-modal">
      <div class="modal-header">
        <h3>{{ isEdit ? "Редактировать участок" : "Новый участок" }}</h3>
        <button class="close-btn" @click="emit('close')">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-row">
          <FormField label="Номер участка" :error="getError('number')" required>
            <input
              v-model="form.number"
              type="text"
              placeholder="А-01"
              @blur="validateSingle('number')"
            />
          </FormField>

          <FormField
            label="Площадь (м²)"
            :error="getError('area_sqm')"
            required
          >
            <input
              v-model.number="form.area_sqm"
              type="number"
              min="1"
              placeholder="600"
              @blur="validateSingle('area_sqm')"
            />
          </FormField>
        </div>

        <FormField
          label="Адрес / расположение"
          :error="getError('address')"
          required
        >
          <input
            v-model="form.address"
            type="text"
            placeholder="Линия А, участок 1"
            @blur="validateSingle('address')"
          />
        </FormField>

        <FormField
          label="Кадастровый номер"
          :error="getError('cadastral_number')"
          hint="Формат: 50:26:0180505:123"
        >
          <input
            v-model="form.cadastral_number"
            type="text"
            placeholder="50:26:0180505:123"
            @blur="validateSingle('cadastral_number')"
          />
        </FormField>

        <FormField label="Собственник">
          <select v-model="form.owner_id">
            <option :value="null">— Без владельца —</option>
            <option v-for="owner in owners" :key="owner.id" :value="owner.id">
              {{ owner.full_name }}
            </option>
          </select>
        </FormField>

        <div class="form-field">
          <label class="form-field-label">Подключения</label>
          <div class="checkboxes">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.has_electricity" />
              <span><i class="pi pi-bolt"></i> Электричество</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.has_water" />
              <span><i class="pi pi-box"></i> Водоснабжение</span>
            </label>
          </div>
        </div>

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
.plot-form-modal {
  max-width: 520px;

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }

  .checkboxes {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    span {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-primary);

      i {
        color: var(--text-secondary);
      }
    }

    &:has(input:checked) span i {
      color: var(--success);
    }
  }

  .modal-footer {
    margin-top: 24px;
    padding: 0;
    border: none;
  }
}
</style>
