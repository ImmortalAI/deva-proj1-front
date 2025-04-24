<template>
    <Button label="Выполнить нарезку из видео" severity="secondary" @click="tasks.createTask({project_id: editor.project_id, task_type: 'frames_extract', prompt: ''})"></Button>
<div class="grid">
    <div class="w-24" v-for="image in editor.videoFrames" :key="image.id">
        <Image :src="getImageUrl(image.id)" :alt="image.file_name" preview />
    </div>
    
</div>
</template>

<script setup lang="ts">
import { useTask } from '@/composables/useTask';
import { useEditorStore } from '@/stores/editor';
import Image from 'primevue/image';

const editor = useEditorStore();
const tasks = useTask();

const getImageUrl = (imgId: string) => `/api/file/download/${imgId}`
</script>