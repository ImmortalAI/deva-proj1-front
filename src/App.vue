<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useUserStore } from './stores/user';

const router = useRouter();
const userStore = useUserStore();

function handleAuth() {
  if (userStore.isAuthenticated) {
    userStore.username = "";
    router.push('/');
  }
  else {
    router.push('/login');
  }
}

function redirectMainPage() {
  router.push("/");
}
</script>

<template>
  <header class="flex justify-between items-center border-b-neutral-700 border-b-2">
    <span @click="redirectMainPage()" class="text-2xl m-2 ml-4 cursor-pointer">DEVA</span>

    <div @click="handleAuth()"
      class="border-2 border-violet-900 rounded-2xl p-2 m-2 mr-4 cursor-pointer hover:bg-violet-950 transition-colors">
      <span v-if="userStore.isAuthenticated">{{ userStore.username }}</span>
      <span v-else>Login</span>
    </div>
  </header>

  <RouterView />
</template>