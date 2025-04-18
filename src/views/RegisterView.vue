<script setup lang="ts">
import {useUserStore} from '@/stores/user';
import {reactive, ref} from 'vue';
import {RouterLink, useRouter} from 'vue-router'
import { FloatLabel, InputGroup, InputGroupAddon, InputText, Button } from 'primevue';
import type { RegisterUserRequest } from '@/models/userScheme';
import type { ErrorResponse } from '@/models/errorScheme';

const router = useRouter();
const userStore = useUserStore();
const username = ref();
const password = ref();
const repeatPassword = ref();
const failed = reactive({isFailed: false, msg: ""});

async function register() {
  if (password.value !== repeatPassword.value) {
    failed.isFailed = true;
    failed.msg = "Пароли не совпадают";
    return;
  }

  const request: RegisterUserRequest = {
    login: username.value,
    password: password.value,
    password_repeat: repeatPassword.value,
  }

  const response = await fetch("/api/auth/register", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });

  if (response.ok) {
    await router.push("/login");
  } else {
    const data = await response.json() as ErrorResponse;
    failed.isFailed = true;
    failed.msg = data.detail || "Произошла ошибка";
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="p-6 rounded-xl w-full max-w-sm border">
      <form class="space-y-4 flex flex-col items-center">
          <p class="text-2xl">Регистрация</p>

        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-user" />
          </InputGroupAddon>
          <FloatLabel variant="on">
            <InputText id="username" v-model="username" type="text" autocomplete="username" name="username" required
              class="w-full" />

            <label for="username" class="text-sm font-medium">Имя пользователя</label>
          </FloatLabel>
        </InputGroup>

        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-lock" />
          </InputGroupAddon>
          <FloatLabel variant="on">
            <InputText id="password" v-model="password" type="password" autocomplete="current-password" name="password"
              required class="w-full" />

            <label for="password" class="text-sm">Пароль</label>
          </FloatLabel>
        </InputGroup>

        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-lock" />
          </InputGroupAddon>
          <FloatLabel variant="on">
            <InputText v-model="repeatPassword" type="password" autocomplete="current-password" name="repeat-password"
              required class="w-full" />

            <label for="repeat-password" class="text-sm">Повторите пароль</label>
          </FloatLabel>
        </InputGroup>

        <div class="w-full pt-5">
          <Button type="submit" @click.prevent="register"
            class="w-full !bg-violet-600 hover:!bg-violet-800 hover:!translate-y-0.5 !border-violet-800" label="Зарегистрироваться" />
        </div>
        <p v-if="failed.isFailed" class="py-2 rounded-lg text-red-600">{{ failed.msg }}</p>
        <div class="flex justify-center py-2 rounded-lg">
          Уже есть аккаунт?
          <RouterLink to="/login" class="hover:text-violet-800 pl-2">
            <u>Войти</u>
          </RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>