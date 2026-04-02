<!-- src/components/common/ConfirmModal.vue -->

<script setup lang="ts">
defineProps<{
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal confirm-modal">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="emit('close')">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <p>{{ message }}</p>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="emit('close')">
          {{ cancelText || "Отмена" }}
        </button>
        <button
          :class="['btn', danger ? 'btn-danger' : 'btn-primary']"
          @click="emit('confirm')"
        >
          {{ confirmText || "Подтвердить" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.confirm-modal {
  max-width: 400px;

  .modal-body p {
    color: #475569;
    line-height: 1.5;
    margin: 0;
  }
}

.btn-danger {
  background: #ef4444;
  color: #fff;

  &:hover {
    background: #dc2626;
  }
}
</style>
