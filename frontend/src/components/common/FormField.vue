<!-- src/components/common/FormField.vue -->

<script setup lang="ts">
defineProps<{
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
}>();
</script>

<template>
  <div class="form-field" :class="{ 'has-error': !!error }">
    <label v-if="label" class="form-field-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>

    <div class="form-field-input">
      <slot />
    </div>

    <Transition name="fade">
      <span v-if="error" class="form-field-error">
        <i class="pi pi-exclamation-circle"></i>
        {{ error }}
      </span>
    </Transition>

    <span v-if="hint && !error" class="form-field-hint">
      {{ hint }}
    </span>
  </div>
</template>

<style lang="scss">
.form-field {
  margin-bottom: 16px;

  &-label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: #374151;
    font-size: 0.9rem;

    .required-mark {
      color: var(--danger);
      margin-left: 2px;
    }
  }

  &-input {
    input,
    select,
    textarea {
      width: 100%;
      padding: 12px 14px;
      border: 2px solid var(--border);
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.2s;
      background: #fff;

      &:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      &::placeholder {
        color: #94a3b8;
      }
    }

    textarea {
      resize: vertical;
      min-height: 100px;
    }
  }

  &.has-error {
    .form-field-input {
      input,
      select,
      textarea {
        border-color: var(--danger);

        &:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
      }
    }
  }

  &-error {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    color: var(--danger);
    font-size: 0.8rem;

    i {
      font-size: 0.75rem;
      flex-shrink: 0;
    }
  }

  &-hint {
    display: block;
    margin-top: 4px;
    font-size: 0.8rem;
    color: var(--text-secondary);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
