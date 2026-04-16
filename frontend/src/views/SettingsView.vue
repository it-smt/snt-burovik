<!-- src/views/SettingsView.vue -->

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useAppToast } from "@/composables/useToast";
import { useValidation } from "@/composables/useValidation";
import FormField from "@/components/common/FormField.vue";

const auth = useAuthStore();
const toast = useAppToast();

const tab = ref<"profile" | "snt" | "notifications">("profile");

// ========== ПРОФИЛЬ ==========
const profileForm = ref({
  full_name: "",
  email: "",
  phone: "",
});

const profileValidation = useValidation(() => profileForm.value, {
  full_name: { required: true, minLength: 3, message: "Минимум 3 символа" },
  email: { required: true, email: true },
  phone: { required: true, phone: true },
});

const profileLoading = ref(false);

// ========== СМЕНА ПАРОЛЯ ==========
const passwordForm = ref({
  current_password: "",
  new_password: "",
  confirm_password: "",
});

const passwordValidation = useValidation(() => passwordForm.value, {
  current_password: { required: true, message: "Введите текущий пароль" },
  new_password: { required: true, minLength: 6 },
  confirm_password: {
    required: true,
    match: { field: "new_password", label: "Новый пароль" },
  },
});

const passwordLoading = ref(false);

// ========== ДАННЫЕ СНТ ==========
const sntForm = ref({
  name: "",
  address: "",
  contact_phone: "",
  contact_email: "",
});

const sntValidation = useValidation(() => sntForm.value, {
  name: { required: true, minLength: 3 },
  address: { required: true, minLength: 5 },
  contact_email: { email: true },
  contact_phone: { phone: true },
});

const sntLoading = ref(false);

// ========== УВЕДОМЛЕНИЯ ==========
const notificationsForm = ref({
  email_enabled: true,
  notify_new_appeals: true,
  notify_meter_readings: true,
  notify_debt_reminder: true,
  debt_reminder_day: 1,
  meter_deadline_day: 25,
});

const notificationsLoading = ref(false);

// ========== INIT ==========
onMounted(async () => {
  if (auth.user) {
    profileForm.value = {
      full_name: auth.user.full_name,
      email: auth.user.email,
      phone: auth.user.phone,
    };
  }
  
  // Загрузка данных СНТ
  if (auth.isChairman || auth.isAdmin) {
    await loadSntData();
  }
});

async function loadSntData() {
  try {
    const { organizationsApi } = await import("@/api/organizations");
    const response = await organizationsApi.get();
    if (response.data && response.data.id !== 0) {
      sntForm.value = {
        name: response.data.name || "",
        address: response.data.address || "",
        contact_phone: response.data.contact_phone || "",
        contact_email: response.data.contact_email || "",
      };
    }
  } catch (error) {
    console.error("Failed to load SNT data:", error);
  }
}

// ========== ACTIONS ==========
async function saveProfile() {
  if (!profileValidation.validate()) return;

  profileLoading.value = true;
  try {
    const { usersApi } = await import("@/api/users");
    await usersApi.updateMe({
      full_name: profileForm.value.full_name,
      email: profileForm.value.email,
      phone: profileForm.value.phone,
    });

    if (auth.user) {
      auth.user.full_name = profileForm.value.full_name;
      auth.user.email = profileForm.value.email;
      auth.user.phone = profileForm.value.phone;
    }

    toast.success("Профиль обновлён");
  } catch {
    toast.error("Не удалось сохранить профиль");
  } finally {
    profileLoading.value = false;
  }
}

async function changePassword() {
  if (!passwordValidation.validate()) return;

  passwordLoading.value = true;
  try {
    const { usersApi } = await import("@/api/users");
    await usersApi.changePassword({
      current_password: passwordForm.value.current_password,
      new_password: passwordForm.value.new_password,
    });

    passwordForm.value = {
      current_password: "",
      new_password: "",
      confirm_password: "",
    };
    passwordValidation.resetErrors();

    toast.success("Пароль изменён");
  } catch (error: any) {
    const message = error.response?.data?.detail || "Не удалось изменить пароль";
    toast.error(message);
  } finally {
    passwordLoading.value = false;
  }
}

async function saveSnt() {
  if (!sntValidation.validate()) return;

  sntLoading.value = true;
  try {
    const { organizationsApi } = await import("@/api/organizations");
    await organizationsApi.update({
      name: sntForm.value.name,
      address: sntForm.value.address,
      contact_phone: sntForm.value.contact_phone || undefined,
      contact_email: sntForm.value.contact_email || undefined,
    });

    toast.success("Данные СНТ сохранены");
  } catch (error: any) {
    const message = error.response?.data?.detail || "Не удалось сохранить данные СНТ";
    toast.error(message);
  } finally {
    sntLoading.value = false;
  }
}

async function saveNotifications() {
  notificationsLoading.value = true;
  try {
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Настройки уведомлений сохранены");
  } catch {
    toast.error("Не удалось сохранить настройки");
  } finally {
    notificationsLoading.value = false;
  }
}

const roleLabels: Record<string, string> = {
  owner: "Собственник",
  chairman: "Председатель",
  accountant: "Бухгалтер",
  admin: "Администратор",
};
</script>

<template>
  <div class="settings-page">
    <div class="page-header">
      <h2 class="page-title">Настройки</h2>
    </div>

    <!-- Табы -->
    <div class="tabs">
      <button
        :class="['tab', { active: tab === 'profile' }]"
        @click="tab = 'profile'"
      >
        <i class="pi pi-user"></i>
        <span>Профиль</span>
      </button>
      <button
        v-if="auth.isChairman || auth.isAdmin"
        :class="['tab', { active: tab === 'snt' }]"
        @click="tab = 'snt'"
      >
        <i class="pi pi-building"></i>
        <span>Данные СНТ</span>
      </button>
      <button
        v-if="auth.isChairman || auth.isAdmin"
        :class="['tab', { active: tab === 'notifications' }]"
        @click="tab = 'notifications'"
      >
        <i class="pi pi-bell"></i>
        <span>Уведомления</span>
      </button>
    </div>

    <!-- ========== ПРОФИЛЬ ========== -->
    <div v-if="tab === 'profile'" class="settings-section">
      <!-- Личные данные -->
      <div class="settings-card card">
        <div class="settings-card-header">
          <h3><i class="pi pi-user"></i> Личные данные</h3>
        </div>

        <form @submit.prevent="saveProfile" class="settings-form">
          <FormField
            label="ФИО"
            :error="profileValidation.getError('full_name')"
            required
          >
            <input
              v-model="profileForm.full_name"
              type="text"
              @blur="profileValidation.validateSingle('full_name')"
            />
          </FormField>

          <div class="form-row">
            <FormField
              label="Email"
              :error="profileValidation.getError('email')"
              required
            >
              <input
                v-model="profileForm.email"
                type="email"
                @blur="profileValidation.validateSingle('email')"
              />
            </FormField>

            <FormField
              label="Телефон"
              :error="profileValidation.getError('phone')"
              required
            >
              <input
                v-model="profileForm.phone"
                type="tel"
                @blur="profileValidation.validateSingle('phone')"
              />
            </FormField>
          </div>

          <FormField label="Роль">
            <input
              :value="roleLabels[auth.userRole ?? ''] || '—'"
              type="text"
              disabled
              class="input-disabled"
            />
          </FormField>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="profileLoading"
            >
              <i
                :class="profileLoading ? 'pi pi-spinner pi-spin' : 'pi pi-save'"
              ></i>
              Сохранить
            </button>
          </div>
        </form>
      </div>

      <!-- Смена пароля -->
      <div class="settings-card card">
        <div class="settings-card-header">
          <h3><i class="pi pi-lock"></i> Смена пароля</h3>
        </div>

        <form @submit.prevent="changePassword" class="settings-form">
          <FormField
            label="Текущий пароль"
            :error="passwordValidation.getError('current_password')"
            required
          >
            <input
              v-model="passwordForm.current_password"
              type="password"
              placeholder="Введите текущий пароль"
              @blur="passwordValidation.validateSingle('current_password')"
            />
          </FormField>

          <div class="form-row">
            <FormField
              label="Новый пароль"
              :error="passwordValidation.getError('new_password')"
              required
              hint="Минимум 6 символов"
            >
              <input
                v-model="passwordForm.new_password"
                type="password"
                placeholder="Новый пароль"
                @blur="passwordValidation.validateSingle('new_password')"
              />
            </FormField>

            <FormField
              label="Подтверждение"
              :error="passwordValidation.getError('confirm_password')"
              required
            >
              <input
                v-model="passwordForm.confirm_password"
                type="password"
                placeholder="Повторите пароль"
                @blur="passwordValidation.validateSingle('confirm_password')"
              />
            </FormField>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="passwordLoading"
            >
              <i
                :class="passwordLoading ? 'pi pi-spinner pi-spin' : 'pi pi-key'"
              ></i>
              Изменить пароль
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ========== ДАННЫЕ СНТ ========== -->
    <div v-if="tab === 'snt'" class="settings-section">
      <div class="settings-card card">
        <div class="settings-card-header">
          <h3><i class="pi pi-building"></i> Информация о СНТ</h3>
        </div>

        <form @submit.prevent="saveSnt" class="settings-form">
          <FormField
            label="Название"
            :error="sntValidation.getError('name')"
            required
          >
            <input
              v-model="sntForm.name"
              type="text"
              @blur="sntValidation.validateSingle('name')"
            />
          </FormField>

          <FormField
            label="Адрес"
            :error="sntValidation.getError('address')"
            required
          >
            <input
              v-model="sntForm.address"
              type="text"
              @blur="sntValidation.validateSingle('address')"
            />
          </FormField>

          <div class="form-row">
            <FormField
              label="Контактный телефон"
              :error="sntValidation.getError('contact_phone')"
              hint="Телефон правления для владельцев"
            >
              <input
                v-model="sntForm.contact_phone"
                type="tel"
                placeholder="+7 900 123-45-67"
                @blur="sntValidation.validateSingle('contact_phone')"
              />
            </FormField>

            <FormField
              label="Контактный email"
              :error="sntValidation.getError('contact_email')"
              hint="Email для обратной связи"
            >
              <input
                v-model="sntForm.contact_email"
                type="email"
                placeholder="info@snt.ru"
                @blur="sntValidation.validateSingle('contact_email')"
              />
            </FormField>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="sntLoading"
            >
              <i
                :class="sntLoading ? 'pi pi-spinner pi-spin' : 'pi pi-save'"
              ></i>
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ========== УВЕДОМЛЕНИЯ ========== -->
    <div v-if="tab === 'notifications'" class="settings-section">
      <div class="settings-card card">
        <div class="settings-card-header">
          <h3><i class="pi pi-bell"></i> Email-уведомления</h3>
        </div>

        <form @submit.prevent="saveNotifications" class="settings-form">
          <!-- Главный переключатель -->
          <div class="toggle-group main-toggle">
            <label class="toggle-label">
              <input
                type="checkbox"
                v-model="notificationsForm.email_enabled"
              />
              <span class="toggle-switch"></span>
              <div class="toggle-info">
                <span class="toggle-title">Email-уведомления</span>
                <span class="toggle-desc">
                  Включить отправку email-уведомлений
                </span>
              </div>
            </label>
          </div>

          <!-- Детальные настройки (показываем только если email включён) -->
          <div
            class="notifications-details"
            :class="{ disabled: !notificationsForm.email_enabled }"
          >
            <div class="toggle-group">
              <label class="toggle-label">
                <input
                  type="checkbox"
                  v-model="notificationsForm.notify_new_appeals"
                  :disabled="!notificationsForm.email_enabled"
                />
                <span class="toggle-switch"></span>
                <div class="toggle-info">
                  <span class="toggle-title">Новые обращения</span>
                  <span class="toggle-desc">
                    Уведомлять председателя о новых обращениях от владельцев
                  </span>
                </div>
              </label>
            </div>

            <div class="toggle-group">
              <label class="toggle-label">
                <input
                  type="checkbox"
                  v-model="notificationsForm.notify_meter_readings"
                  :disabled="!notificationsForm.email_enabled"
                />
                <span class="toggle-switch"></span>
                <div class="toggle-info">
                  <span class="toggle-title">Показания счётчиков</span>
                  <span class="toggle-desc">
                    Уведомлять бухгалтера о переданных показаниях для проверки
                  </span>
                </div>
              </label>
            </div>

            <div class="toggle-group">
              <label class="toggle-label">
                <input
                  type="checkbox"
                  v-model="notificationsForm.notify_debt_reminder"
                  :disabled="!notificationsForm.email_enabled"
                />
                <span class="toggle-switch"></span>
                <div class="toggle-info">
                  <span class="toggle-title">Напоминание о задолженности</span>
                  <span class="toggle-desc">
                    Ежемесячно напоминать владельцам о неоплаченных начислениях
                  </span>
                </div>
              </label>
            </div>

            <div class="form-divider">
              <span>Расписание</span>
            </div>

            <div class="form-row">
              <FormField
                label="Крайний день подачи показаний"
                :hint="`Владельцы должны передать до ${notificationsForm.meter_deadline_day}-го числа`"
              >
                <input
                  v-model.number="notificationsForm.meter_deadline_day"
                  type="number"
                  min="1"
                  max="28"
                  :disabled="!notificationsForm.email_enabled"
                />
              </FormField>

              <FormField
                label="День отправки напоминаний"
                :hint="`Напоминания уходят ${notificationsForm.debt_reminder_day}-го числа`"
              >
                <input
                  v-model.number="notificationsForm.debt_reminder_day"
                  type="number"
                  min="1"
                  max="28"
                  :disabled="!notificationsForm.email_enabled"
                />
              </FormField>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="notificationsLoading"
            >
              <i
                :class="
                  notificationsLoading ? 'pi pi-spinner pi-spin' : 'pi pi-save'
                "
              ></i>
              Сохранить
            </button>
          </div>
        </form>
      </div>

      <!-- Превью уведомлений -->
      <div class="settings-card card">
        <div class="settings-card-header">
          <h3><i class="pi pi-eye"></i> Какие письма получат пользователи</h3>
        </div>

        <div class="email-preview-list">
          <div class="email-preview-item">
            <div class="email-preview-icon">
              <i class="pi pi-envelope" style="color: #2563eb"></i>
            </div>
            <div class="email-preview-info">
              <strong>Новое начисление</strong>
              <span
                >Владелец получает письмо при создании начисления на его
                участок</span
              >
            </div>
            <span class="badge badge-success">Всегда</span>
          </div>

          <div class="email-preview-item">
            <div class="email-preview-icon">
              <i class="pi pi-reply" style="color: #16a34a"></i>
            </div>
            <div class="email-preview-info">
              <strong>Ответ на обращение</strong>
              <span
                >Владелец получает письмо когда председатель ответил на
                обращение</span
              >
            </div>
            <span class="badge badge-success">Всегда</span>
          </div>

          <div class="email-preview-item">
            <div class="email-preview-icon">
              <i class="pi pi-megaphone" style="color: #d97706"></i>
            </div>
            <div class="email-preview-info">
              <strong>Важное объявление</strong>
              <span
                >Все владельцы получают письмо при публикации важного
                объявления</span
              >
            </div>
            <span class="badge badge-success">Всегда</span>
          </div>

          <div class="email-preview-item">
            <div class="email-preview-icon">
              <i class="pi pi-exclamation-triangle" style="color: #dc2626"></i>
            </div>
            <div class="email-preview-info">
              <strong>Напоминание о долге</strong>
              <span
                >Владелец получает напоминание о неоплаченных начислениях</span
              >
            </div>
            <span
              :class="[
                'badge',
                notificationsForm.notify_debt_reminder &&
                notificationsForm.email_enabled
                  ? 'badge-success'
                  : 'badge-danger',
              ]"
            >
              {{
                notificationsForm.notify_debt_reminder &&
                notificationsForm.email_enabled
                  ? "Включено"
                  : "Выключено"
              }}
            </span>
          </div>

          <div class="email-preview-item">
            <div class="email-preview-icon">
              <i class="pi pi-inbox" style="color: #6366f1"></i>
            </div>
            <div class="email-preview-info">
              <strong>Новое обращение</strong>
              <span>Председатель получает письмо о новом обращении</span>
            </div>
            <span
              :class="[
                'badge',
                notificationsForm.notify_new_appeals &&
                notificationsForm.email_enabled
                  ? 'badge-success'
                  : 'badge-danger',
              ]"
            >
              {{
                notificationsForm.notify_new_appeals &&
                notificationsForm.email_enabled
                  ? "Включено"
                  : "Выключено"
              }}
            </span>
          </div>

          <div class="email-preview-item">
            <div class="email-preview-icon">
              <i class="pi pi-gauge" style="color: #f59e0b"></i>
            </div>
            <div class="email-preview-info">
              <strong>Показания переданы</strong>
              <span>Бухгалтер получает письмо для проверки показаний</span>
            </div>
            <span
              :class="[
                'badge',
                notificationsForm.notify_meter_readings &&
                notificationsForm.email_enabled
                  ? 'badge-success'
                  : 'badge-danger',
              ]"
            >
              {{
                notificationsForm.notify_meter_readings &&
                notificationsForm.email_enabled
                  ? "Включено"
                  : "Выключено"
              }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.settings-page {
  max-width: 800px;

  .tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 24px;
    background: #f1f5f9;
    padding: 4px;
    border-radius: 10px;
  }

  .tab {
    flex: 1;
    padding: 10px 16px;
    border: none;
    background: transparent;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    white-space: nowrap;
    font-size: 0.9rem;

    &.active {
      background: #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      color: var(--primary);
    }

    @media (max-width: 480px) {
      font-size: 0.8rem;
      gap: 4px;
      padding: 10px 12px;
    }
  }
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-card {
  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h3 {
      margin: 0;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--text-primary);
    }
  }
}

.settings-form {
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

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
      background: var(--border);
    }
  }

  .form-actions {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;

    @media (max-width: 640px) {
      .btn {
        width: 100%;
      }
    }
  }
}

.input-disabled {
  background: #f8fafc !important;
  color: var(--text-secondary) !important;
  cursor: not-allowed;
}

// ===== TOGGLES =====
.toggle-group {
  margin-bottom: 16px;

  &:last-of-type {
    margin-bottom: 0;
  }

  &.main-toggle {
    padding-bottom: 20px;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--border);
  }
}

.toggle-label {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  cursor: pointer;
  padding: 8px 0;

  input[type="checkbox"] {
    display: none;

    &:checked + .toggle-switch {
      background: var(--primary);

      &::after {
        transform: translateX(20px);
      }
    }

    &:disabled + .toggle-switch {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.toggle-switch {
  width: 44px;
  height: 24px;
  background: #cbd5e1;
  border-radius: 12px;
  position: relative;
  transition: background 0.3s;
  flex-shrink: 0;
  margin-top: 2px;

  &::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.3s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
}

.toggle-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toggle-title {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.toggle-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

// ===== NOTIFICATIONS DETAILS =====
.notifications-details {
  transition: opacity 0.3s;

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

// ===== EMAIL PREVIEW =====
.email-preview-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.email-preview-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
}

.email-preview-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  i {
    font-size: 1.1rem;
  }
}

.email-preview-info {
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    font-size: 0.9rem;
    color: var(--text-primary);
    margin-bottom: 2px;
  }

  span {
    display: block;
    font-size: 0.8rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }
}

@media (max-width: 640px) {
  .email-preview-item {
    flex-wrap: wrap;
    gap: 10px;

    .badge {
      margin-left: auto;
    }
  }

  .email-preview-info {
    flex: 1;
    min-width: 150px;
  }
}
</style>
