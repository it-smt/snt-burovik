<!-- src/views/LoginView.vue -->

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function handleLogin() {
  error.value = "";
  loading.value = true;

  try {
    await auth.login(email.value, password.value);
    const redirect = (route.query.redirect as string) || "/";
    router.push(redirect);
  } catch (e: any) {
    error.value = e.response?.data?.detail || "Ошибка входа";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <i class="pi pi-sun"></i>
        <h1>СОНТ «Буровик»</h1>
        <p>Вход в систему</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="error" class="error-message">
          <i class="pi pi-exclamation-circle"></i>
          {{ error }}
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="mail@example.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Введите пароль"
            required
            autocomplete="current-password"
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary btn-login"
          :disabled="loading"
        >
          <i v-if="loading" class="pi pi-spinner pi-spin"></i>
          <span>{{ loading ? "Вход..." : "Войти" }}</span>
        </button>
      </form>

      <!-- Тестовые аккаунты -->
      <div class="test-accounts">
        <p>Тестовые аккаунты (пароль: 123456)</p>
        <div class="accounts-list">
          <button
            type="button"
            @click="
              email = 'owner@test.ru';
              password = '123456';
            "
          >
            👤 Владелец
          </button>
          <button
            type="button"
            @click="
              email = 'chairman@test.ru';
              password = '123456';
            "
          >
            👔 Председатель
          </button>
          <button
            type="button"
            @click="
              email = 'accountant@test.ru';
              password = '123456';
            "
          >
            💰 Бухгалтер
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px;
}

.login-card {
  background: #fff;
  border-radius: 16px;
  padding: 32px 28px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

  @media (max-width: 480px) {
    padding: 24px 20px;
    border-radius: 12px;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 28px;

  i {
    font-size: 2.5rem;
    color: #f59e0b;

    @media (max-width: 480px) {
      font-size: 2rem;
    }
  }

  h1 {
    margin: 12px 0 4px;
    font-size: 1.4rem;
    color: var(--text-primary);

    @media (max-width: 480px) {
      font-size: 1.25rem;
    }
  }

  p {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.btn-login {
  width: 100%;
  padding: 14px;
  margin-top: 8px;
}

.test-accounts {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border);

  p {
    text-align: center;
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 12px;
  }

  .accounts-list {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;

    button {
      background: #f1f5f9;
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #e2e8f0;
      }
    }
  }
}
</style>
