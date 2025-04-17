<script setup lang="ts">
import {useUserStore} from '@/stores/user';
import {ref} from 'vue';
import {useRouter} from 'vue-router';

const router = useRouter();
const userStore = useUserStore();
const username = ref();
const password = ref();
const isFailed = ref(false);

async function login() {
  // const response = await fetch("/api/login", {
  //     method: 'POST',
  //     headers: {
  //         'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({ username: username.value, password: password.value })
  // });

  // if(response.ok){
  //     const data = await response.json();
  //     userStore.username = data?.username;
  // }
  // else{
  //     isFailed.value = true;
  //     password.value = '';
  // }

  // For debugging purposes
  userStore.username = username.value;
  await router.push("/")
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="p-6 rounded-xl shadow-md w-full max-w-sm border">
      <form class="space-y-4 content-center">
        <div>
          <label for="password" class="flex justify-center py-2 rounded-lg text-2xl">Вход</label>
        </div>
        <!--fixme placeholders-->
        <div>
          <label for="username" class="block text-sm font-medium">Имя пользователя:</label>
          <input v-model="username" name="username" type="text" placeholder="Username" autocomplete="username"
                 class="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2" required/>
        </div>
        <div>
          <label for="password" class="block text-sm text-size-sm">Пароль:</label>
          <input autocomplete="current-password" v-model="password" name="password" type="password"
                 placeholder="Password" class="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2" required/>
        </div>
        <div class="w-full pt-5">
          <button @click.prevent="login" type="submit"
                  class="w-full py-2 rounded-lg border hover:bg-violet-800 hover:translate-y-0.5">
            Войти
          </button>
        </div>
        <p v-if="isFailed" class="w-full py-2 rounded-lg">Неверный логин или пароль</p>
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