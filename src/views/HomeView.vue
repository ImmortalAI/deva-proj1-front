<script setup lang="ts">
import { reactive, ref } from 'vue';
import FileElement from '@/components/FileElement.vue'

interface FileData {
  name: string;
  imageUrl: string;
}

const availableFiles = ref<FileData[]>([{name: "Новый проект", imageUrl: "example.com"}]);
</script>

<template>
  <main class="ml-[10%] mr-[10%] mt-8">
    <div v-for="availableFile in availableFiles">
      <FileElement :imgFile="availableFile.imageUrl" :nameFile="availableFile.name" />
    </div>
  </main>
</template>
