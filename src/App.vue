<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useUserStore } from './stores/user';

const userStore = useUserStore();
</script>

<template>
  <header class="flex justify-between items-center border-b-neutral-700 border-b-2">
    <span class="text-2xl m-2 ml-4">DEVA</span>

    <div class="border-2 border-violet-900 rounded-2xl p-2 m-2 mr-4">
      <span v-if="userStore.username !== ''" >{{ userStore.username }}</span>
      <span v-else><a href="login">Log In</a></span>
    </div>
  </header>

  <RouterView />
</template>