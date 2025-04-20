<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { FloatLabel, InputGroup, InputGroupAddon, InputText, Button } from 'primevue';
import type { LoginUserRequest } from '@/models/userScheme';
import fetchUserData from '@/utils/fetchUserData';
import axios from 'axios';

const router = useRouter();
const userStore = useUserStore();
const username = ref();
const password = ref();
const isFailed = ref(false);

async function login() {
  const request: LoginUserRequest = {
    login: username.value,
    password: password.value
  }

  try {
    await axios.post("/api/auth/login", request);
    await fetchUserData();
    router.push("/");
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 401) {
      isFailed.value = true;
      password.value = '';
    } else {
      console.log(e); //FIXME
    }
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="p-6 rounded-xl w-full max-w-sm border">
      <form class="space-y-4 flex flex-col items-center">
        <p class="text-2xl">Вход</p>

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

        <div class="w-full pt-5">
          <Button type="submit" @click.prevent="login"
            class="w-full !bg-violet-600 hover:!bg-violet-800 hover:!translate-y-0.5 !border-violet-800"
            label="Войти" />
        </div>
        <p v-if="isFailed" class="py-2 rounded-lg text-red-600">Неверный логин или пароль</p>
        <div class="flex justify-center py-2 rounded-lg">
          Нет аккаунта?
          <RouterLink to="/register" class="hover:text-violet-800 pl-2">
            <u>Зарегистрироваться</u>
          </RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>