<template>
    <Button v-if="editor.videoFrames.length == 0" label="Выполнить нарезку из видео" severity="secondary" @click="tasks.createTask({project_id: editor.project_id, task_type: 'frames_extract', prompt: ''})" />
    <Button label="Загрузить изображение" severity="secondary" />
<div class="flex flex-wrap max-h-[75vh] overflow-y-scroll">
    <div class="w-48 border-2 border-neutral-500 rounded-xl p-1 m-4" v-for="image in editor.videoFrames" :key="image.id">
        <Image :image-class="['aspect-video', 'object-cover']" :src="getImageUrl(image.id)" :alt="image.file_name" preview />
    </div>
    
</div>
</template>

<script setup lang="ts">
import { useTask } from '@/composables/useTask';
import { useEditorStore } from '@/stores/editor';
import Image from 'primevue/image';
import Button from 'primevue/button';

const editor = useEditorStore();
const tasks = useTask();

const getImageUrl = (imgId: string) => `/api/file/download/${imgId}`
</script>