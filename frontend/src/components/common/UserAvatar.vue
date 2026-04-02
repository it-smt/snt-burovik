<!-- src/components/common/UserAvatar.vue -->

<script setup lang="ts">
import type { UserRole } from "@/types";

const props = withDefaults(
  defineProps<{
    name: string;
    role?: UserRole;
    size?: "sm" | "md" | "lg";
  }>(),
  {
    size: "md",
  },
);

const roleColors: Record<UserRole, string> = {
  owner: "linear-gradient(135deg, #22c55e, #16a34a)",
  chairman: "linear-gradient(135deg, #6366f1, #4f46e5)",
  accountant: "linear-gradient(135deg, #f59e0b, #d97706)",
  admin: "linear-gradient(135deg, #ef4444, #dc2626)",
};

const defaultGradient = "linear-gradient(135deg, #94a3b8, #64748b)";
</script>

<template>
  <div
    class="user-avatar"
    :class="[`size-${size}`]"
    :style="{ background: role ? roleColors[role] : defaultGradient }"
  >
    {{ name.charAt(0).toUpperCase() }}
  </div>
</template>

<style lang="scss">
.user-avatar {
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: 50%;
  flex-shrink: 0;

  &.size-sm {
    width: 32px;
    height: 32px;
    font-size: 0.85rem;
  }

  &.size-md {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  &.size-lg {
    width: 56px;
    height: 56px;
    font-size: 1.3rem;
  }
}
</style>
