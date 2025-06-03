<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import ToggleButton from 'primevue/togglebutton';
import Button from 'primevue/button'
import { useUserStore } from '@/stores/user';
import { useTheme } from '@/composables/useTheme';
import { useToast } from 'primevue';
import { setToastInstance } from '@/utils/toastService';

const router = useRouter();
const userStore = useUserStore();
const theming = useTheme();
const toast = useToast();

setToastInstance(toast);

async function handleAuth() {
  if (userStore.isAuthenticated) {
    await userStore.logout();
    router.push('/'); 
  }
  else {
    router.push('/login');
  }
}
</script>

<template>
  <header class="flex justify-between items-center border-b-neutral-700 border-b-2 h-1/12">
    <span @click="router.push('/')" class="text-2xl m-2 ml-4 cursor-pointer">Генератор ИИ-конспектов</span>

    <div class="flex">
      <ToggleButton
        class="w-11 aspect-square p-0 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-950"
        :modelValue="theming.isDark.value" unstyled onLabel="🌙" offLabel="☀️" size="small"
        @update:modelValue="theming.toggleTheme" />
      <Button @click="handleAuth()" class="p-2 m-2 mr-4 cursor-pointer transition-colors">
        <span v-if="userStore.isAuthenticated">{{ userStore.username }}</span>
        <span v-else>Авторизация</span>
      </Button>
    </div>
  </header>

  <div class="grow min-h-0">
    <RouterView />
  </div>
  <Toast/>
  <ConfirmDialog/>
</template>