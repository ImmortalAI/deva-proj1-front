<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import FileElement from '@/components/FileElement.vue'
import { useUserStore } from '@/stores/user';
import { fetchProjects } from '@/utils/projectCRUD';

const user = useUserStore();

interface FileData {
  id: string;
  name: string;
  imageUrl?: string;
}

const availableFiles = ref<FileData[]>([{name: "Новый проект", id: "0"}]);
onMounted(async () => {
  if (user.isAuthenticated) {
    if(availableFiles.value.length > 1) {
      availableFiles.value = [{name: "Новый проект", id: "0"}];
    }
    (await fetchProjects())?.forEach((project) => {
      availableFiles.value.push(project);
  })
  }
})
</script>

<template>
  <main class="ml-[10%] mr-[10%] mt-8">
    <div v-if="user.isAuthenticated">
      <div v-for="availableFile in availableFiles">
        <FileElement class="mb-4" :idFile="availableFile.id" :imgFile="availableFile.imageUrl" :nameFile="availableFile.name" />
      </div>
    </div>
    <div v-else>
      <h1>Для начала работы войдите или зарегистрируйтесь</h1>
    </div>
  </main>
</template>
