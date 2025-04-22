<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import ToggleButton from 'primevue/togglebutton';

import { useUserStore } from './stores/user';
import logoutUser from './utils/logoutUser';
import { useTheme } from './composables/useTheme';

const router = useRouter();
const userStore = useUserStore();
const theming = useTheme();

function handleAuth() {
  if (userStore.isAuthenticated) {
    logoutUser();
    router.push('/');
  }
  else {
    router.push('/login');
  }
}
</script>

<template>
  <header class="flex justify-between items-center border-b-neutral-700 border-b-2 h-1/12">
    <span @click="router.push('/')" class="text-2xl m-2 ml-4 cursor-pointer">DEVA</span>

    <div class="flex">
      <ToggleButton :modelValue="theming.isDark.value" onLabel="🌙"
      offLabel="☀️" size="small" @update:modelValue="theming.toggleTheme" />
      <div @click="handleAuth()"
        class="border-2 border-violet-900 rounded-2xl p-2 m-2 mr-4 cursor-pointer hover:bg-violet-950 transition-colors">
        <span v-if="userStore.isAuthenticated">{{ userStore.username }}</span>
        <span v-else>Login</span>
      </div>
    </div>
  </header>

  <div class="h-11/12">
    <RouterView />
  </div>
</template>