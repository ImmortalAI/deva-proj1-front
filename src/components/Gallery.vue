<template>
    <div class="w-full">
        <div class="flex gap-4">
            <Button v-if="editor.videoFrames.length == 0" :disabled="editor.taskState === 'in_progress'"
                label="Выполнить нарезку из видео" severity="secondary"
                @click="tasks.createTask({ project_id: editor.project_id, task_type: 'frames_extract', prompt: '' })" />
            <ProgressSpinner v-if="editor.taskState === 'in_progress'" class="!w-12 !h-12 !m-0"></ProgressSpinner>
            <Button label="Загрузить изображение" severity="secondary" />
        </div>
        <div class="flex items-center w-full">
            <div class="flex flex-wrap max-h-[75vh] overflow-y-scroll">
                <div class="w-48 border-2 border-neutral-500 rounded-xl p-1 m-4 flex items-center"
                    v-for="image in videoImagesToShow" :key="image.id">
                    <Image @show="loadMetaImage(image.id)" ref="el => imageElRefs[image.id] = el" :image-class="['aspect-video', 'object-cover']" :src="getImageUrl(image.id)"
                        :alt="image.file_name" preview>
                        <template #original>
                            <div class="flex gap-4 p-8" @click.stop="loadMetaImage(image.id)">
                                <img class="w-2/3 object-contain" :src="getImageUrl(image.id)" :alt="image.file_name" />
                                <div class="basis-1/2 flex flex-col p-8 gap-4 bg-neutral-400 dark:bg-neutral-800">
                                    <InputText v-model="timecodeText" disabled></InputText>
                                    <IftaLabel class="grow-1">
                                        <Textarea v-model="textareaContent" id="image-comment"
                                            class="w-full h-full"></Textarea>
                                        <label for="image-comment">Комментарий к изображению</label>
                                    </IftaLabel>
                                    <Button @click="addCommentImage(image.id)" severity="contrast"
                                        label="Добавить комментарий"></Button>
                                    <Button @click="hideImage(image.id)" severity="danger"
                                        label="Скрыть изображение"></Button>
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
import InputText from 'primevue/inputtext';
import { computed, ref } from 'vue';
import type { FilePatchRequest } from '@/models/fileSchema';
import axiosI from '@/utils/axiosInstance'
const editor = useEditorStore();
const tasks = useTask();

const getImageUrl = (imgId: string) => `/file/download/${imgId}`

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
    return editor.videoFrames.filter((frame) => !frame.metadata_is_hide).sort((a, b) => a.metadata_timecode - b.metadata_timecode);
})

const timecodeText = ref<string>("");
const textareaContent = ref<string>("");

const imageElRefs = ref<any>({});

const loadMetaImage = async (imgId: string) => {
        const index = editor.videoFrames.findIndex((frame) => frame.id === imgId);
        if (index !== -1) {
            timecodeText.value = numberToTimeStr(editor.videoFrames[index].metadata_timecode);
            textareaContent.value = editor.videoFrames[index].metadata_text;
        }
}

const addCommentImage = async (imgId: string) => {
    const index = editor.videoFrames.findIndex((frame) => frame.id === imgId);
    if (index !== -1 && textareaContent.value) {
        editor.videoFrames[index].metadata_text = textareaContent.value;
        await axiosI.patch(`/file/${imgId}`, { metadata_text: textareaContent.value } as FilePatchRequest).catch(e => console.log(e));
        textareaContent.value = "";
        timecodeText.value = "";
        const imgComp = imageElRefs.value[imgId];
        if (imgComp?.hide) imgComp.hide();
    }
}

const hideImage = async (imgId: string) => {
    const index = editor.videoFrames.findIndex((frame) => frame.id === imgId);
    if (index !== -1) {
        editor.videoFrames[index].metadata_is_hide = true;
        await axiosI.patch(`/file/${imgId}`, { metadata_is_hide: true } as FilePatchRequest).catch(e => console.log(e));
        const imgComp = imageElRefs.value[imgId];
        if (imgComp?.hide) imgComp.hide();
    }
}
</script>