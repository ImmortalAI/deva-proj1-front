<template>
    <div class="w-full">
        <div class="flex gap-4">
            <Button v-if="editor.videoFrames.length == 0" :disabled="editor.taskState === 'in_progress'" label="Выполнить нарезку из видео" severity="secondary"
                @click="tasks.createTask({ project_id: editor.project_id, task_type: 'frames_extract', prompt: '' })" />
            <ProgressSpinner v-if="editor.taskState === 'in_progress'" class="!w-12 !h-12 !m-0"></ProgressSpinner>
            <Button label="Загрузить изображение" severity="secondary" />
        </div>
        <div class="flex items-center w-full">
            <div class="flex flex-wrap max-h-[75vh] overflow-y-scroll">
                <div class="w-48 border-2 border-neutral-500 rounded-xl p-1 m-4 flex items-center"
                    v-for="image in editor.videoFrames" :key="image.id">
                    <Image :image-class="['aspect-video', 'object-cover']" :src="getImageUrl(image.id)"
                        :alt="image.file_name" preview>
                        <template #original="{ class: originalClass }">
                            <div class="flex gap-4 p-8" @click.stop>
                                <img class="w-2/3 object-contain" :src="getImageUrl(image.id)"
                                    :alt="image.file_name" />
                                <div class="basis-1/2 flex flex-col p-8 gap-4 bg-neutral-400 dark:bg-neutral-800">
                                    <IftaLabel class="grow-1">
                                        <Textarea id="image-comment" class="w-full h-full" ></Textarea>
                                        <label for="image-comment">Комментарий к изображению</label>
                                    </IftaLabel>
                                    <Button severity="contrast" label="Добавить комментарий"></Button>
                                    <Button severity="danger" label="Скрыть изображение"></Button>
                                </div>
                            </div>
                        </template>
                    </Image>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useTask } from '@/composables/useTask';
import { useEditorStore } from '@/stores/editor';
import Image from 'primevue/image';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import IftaLabel from 'primevue/iftalabel';
import ProgressSpinner from 'primevue/progressspinner';
import { ref } from 'vue';

const editor = useEditorStore();
const tasks = useTask();

const getImageUrl = (imgId: string) => `/api/file/download/${imgId}`

const imageComment = ref('')
</script>