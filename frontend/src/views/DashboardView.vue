<!-- src/views/DashboardView.vue -->

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import OwnerDashboard from "@/components/dashboard/OwnerDashboard.vue";
import ChairmanDashboard from "@/components/dashboard/ChairmanDashboard.vue";
import AccountantDashboard from "@/components/dashboard/AccountantDashboard.vue";

const auth = useAuthStore();
</script>

<template>
  <div>
    <h2 class="page-title">Добро пожаловать, {{ auth.user?.full_name }}!</h2>

    <OwnerDashboard v-if="auth.isOwner" />
    <ChairmanDashboard v-else-if="auth.isChairman || auth.isAdmin" />
    <AccountantDashboard v-else-if="auth.isAccountant" />
  </div>
</template>

<style lang="scss">
.page-title {
  color: #1e293b;
  margin-bottom: 24px;
  font-size: 1.5rem;
}
</style>
