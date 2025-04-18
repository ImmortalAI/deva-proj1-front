<script setup lang="ts">
import { reactive, ref } from 'vue';
import FileElement from '@/components/FileElement.vue'
import { useUserStore } from '@/stores/user';

const user = useUserStore();

interface FileData {
  id: number;
  name: string;
  imageUrl?: string;
}

const availableFiles = ref<FileData[]>([{name: "Новый проект", id: 0}, {name: "AbobaProj1", id: 1}, {name: "AbobaProj2", id: 2}]);
</script>

<template>
  <main class="ml-[10%] mr-[10%] mt-8">
    <div v-if="user.isAuthenticated">
      <div v-for="availableFile in availableFiles">
        <FileElement class="mb-4" :idFile="availableFile.id.toString()" :imgFile="availableFile.imageUrl" :nameFile="availableFile.name" />
      </div>
    </div>
    <div v-else>
      <h1>Для начала работы войдите или зарегистрируйтесь</h1>
    </div>
  </main>
</template>
