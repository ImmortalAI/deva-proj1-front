<template>
    <div class="w-full">
        <div class="flex gap-4">
            <Button v-if="editorStore.videoFrames.length == 0" :disabled="editorStore.mediaFile == null || editorStore.taskState === 'in_progress'"
                label="Выполнить нарезку из видео" severity="secondary"
                @click="tasks.createTask({ project_id: editorStore.project_id, task_type: 'frames_extract', prompt: '' })" />
            <ProgressSpinner v-if="editorStore.taskState === 'in_progress'" class="!w-12 !h-12 !m-0"></ProgressSpinner>
            <Button label="Загрузить изображение" severity="secondary" />
        </div>
        <div class="flex items-center w-full">
            <div class="flex flex-wrap max-h-[75vh] overflow-y-scroll">
                <div class="w-48 border-2 border-neutral-500 rounded-xl p-1 m-4 flex items-center"
                     v-for="image in videoImagesToShow" :key="image.id">
                    <div :key="image.id">
                        <!-- Clickable image with overlay -->
                        <div
                            class="relative aspect-video cursor-pointer group"
                            @click="openModal(image)"
                        >
                            <img
                                :src="getImageUrl(image.id)"
                                :alt="image.file_name"
                                class="w-full h-full object-cover rounded-lg"
                            />
                            <div
                                class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                            >
                                <i class="pi pi-eye text-white text-2xl"/>
                            </div>
                        </div>

                        <!-- Dialog for this image -->
                        <Dialog
                            v-model:visible="isDialogVisible"
                            modal
                            header="Просмотр изображения"
                            class="w-full max-w-screen-2xl min-h-[400px]"
                            :dismissableMask="true"
                            :draggable="false"
                            :closable="true"
                            :breakpoints="{ '960px': '95vw', '640px': '100vw' }"
                            @hide="onDialogHide"
                        >
                            <div class="flex flex-col lg:flex-row gap-4 p-6" @click.stop>
                                <!-- Left: Image and controls -->
                                <div class="flex flex-col w-full lg:w-2/3 gap-4 justify-between max-h-[80vh]">
                                    <div class="flex-grow flex items-center justify-center overflow-auto">
                                        <img
                                            :src="getImageUrl(image.id)"
                                            :alt="image.file_name"
                                            class="rounded-lg max-h-full object-contain transition-transform duration-300"
                                            :style="imageTransformStyle"
                                        />
                                    </div>

                                    <!-- Transform buttons -->
                                    <div class="flex gap-3 items-center justify-center pt-4">
                                        <Button icon="pi pi-search-plus" @click="scale *= 1.5" />
                                        <Button icon="pi pi-search-minus" @click="scale = Math.max(scale / 1.5, 0.1)" />
                                        <Button icon="pi pi-refresh" @click="rotation += 90" />
                                        <Button icon="pi pi-times" @click="resetTransform()" />
                                    </div>
                                </div>

                                <!-- Right: Metadata panel -->
                                <div class="w-full lg:w-1/3 flex flex-col gap-4 bg-neutral-300 dark:bg-neutral-800 rounded-2xl p-6 min-h-[300px]">
                                    <!-- Timecode row -->
                                    <InputText v-model="timecodeText" disabled class="bg-white dark:bg-neutral-700" />

                                    <div class="flex-grow flex flex-col">
                                        <Textarea
                                            v-model="textareaContent"
                                            id="image-comment"
                                            class="w-full h-full min-h-[120px] resize-none flex-grow"
                                            placeholder="Комментарий к изображению"
                                        />
                                    </div>

                                    <Button
                                        @click="addCommentImage(image.id)"
                                        severity="contrast"
                                        label="Добавить комментарий"
                                        icon="pi pi-comment"
                                    />
                                    <Button
                                        @click="hideImage(image.id)"
                                        severity="danger"
                                        label="Скрыть изображение"
                                        icon="pi pi-eye-slash"
                                    />
                                </div>

                            </div>
                        </Dialog>

                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {useTask} from '@/composables/useTask';
import {useEditorStore} from '@/stores/editor';
import {computed, ref} from 'vue';
import type {FileData, FilePatchRequest} from '@/models/fileSchema';
import axiosI from '@/utils/axiosInstance'

import type { ErrorResponse } from '@/models/errorSchema';
import { showAxiosErrorToast } from '@/utils/toastService';
const editorStore = useEditorStore();
const tasks = useTask();

const getImageUrl = (imgId: string) => `${import.meta.env.VITE_BASE_API_URL}/file/download/${imgId}`

const numberToTimeStr = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const remaining = seconds % 3600;
    const minutes = Math.floor(remaining / 60);
    const secs = Math.floor(remaining % 60);
    return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
    ].join(':');
};

const videoImagesToShow = computed(() => {
    return editorStore.videoFrames.filter((frame) => !frame.metadata_is_hide).sort((a, b) => a.metadata_timecode - b.metadata_timecode);
})

const timecodeText = ref<string>("");
const textareaContent = ref<string>("");

const imageElRefs = ref<any>({});

const loadMetaImage = async (imgId: string) => {
    const index = editorStore.videoFrames.findIndex((frame) => frame.id === imgId);
    if (index !== -1) {
        timecodeText.value = formatTimecode(editorStore.videoFrames[index]);
        textareaContent.value = editorStore.videoFrames[index].metadata_text;

    }
}

const addCommentImage = async (imgId: string) => {
    const index = editorStore.videoFrames.findIndex((frame) => frame.id === imgId);
    if (index !== -1 && textareaContent.value) {
        editorStore.videoFrames[index].metadata_text = textareaContent.value;
        await axiosI.patch(`/file/${imgId}`, {metadata_text: textareaContent.value} as FilePatchRequest).catch(e => console.log(e));
        textareaContent.value = "";
        timecodeText.value = "";
        const imgComp = imageElRefs.value[imgId];
        if (imgComp?.hide) imgComp.hide();
    }
}

const hideImage = async (imgId: string) => {
    const index = editorStore.videoFrames.findIndex((frame) => frame.id === imgId);
    if (index !== -1) {
        editorStore.videoFrames[index].metadata_is_hide = true;
        await axiosI.patch(`/file/${imgId}`, {metadata_is_hide: true} as FilePatchRequest).catch(e => console.log(e));

        const imgComp = imageElRefs.value[imgId];
        if (imgComp?.hide) imgComp.hide();
    }
}

const activeImage = ref<FileData | null>(null)
const scale = ref(1)
const rotation = ref(0)

const openModal = (image: any) => {
    activeImage.value = image
    isDialogVisible.value = true
    textareaContent.value = '' // or preload if needed
    timecodeText.value = formatTimecode(image);
}

const resetTransform = () => {
    scale.value = 1
    rotation.value = 0
    activeImage.value = null
}

const imageTransformStyle = computed(() => ({
    transform: `scale(${scale.value}) rotate(${rotation.value}deg)`
}))

const isDialogVisible = ref(false)

const onDialogHide = () => {
    isDialogVisible.value = false
    resetTransform()
}

function formatTimecode(image: any): string {
    return `Тайм-код:  ${numberToTimeStr(image.metadata_timecode)}`
}

</script>