<template>
    <div class="bg-neutral-800">
        <div v-if="editorStore.transcriptionFile == null" class="w-full h-full flex items-center justify-center">
            <Button v-if="editorStore.taskState === 'not_started'" :disabled="editorStore.mediaFile == null"
                @click="tasks.createTask({ project_id: editorStore.project_id, task_type: 'transcribe', prompt: '' })"
                class="w-fit h-fit p-0 rounded-full">Транскрибировать</Button>
            <div class="w-4/5" v-else>
                <p>Обработка...</p>
                <ProgressBar :mode="tasks.transcribeTaskProgress.value == 0 ? 'indeterminate' : 'determinate'" :value="tasks.transcribeTaskProgress.value">{{  Math.floor(tasks.transcribeTaskProgress.value) }} %</ProgressBar>
            </div>
        </div>
        <div v-else class="h-full">
            <ScrollPanel style="width: 100%; height: 100%">
                <template v-for="item, ind in transcriptionItems">
                    <div :class="[{ 'bg-neutral-900': ind % 2 === 1 }]" class="p-2">
                        <div class="text-xs text-violet-600 flex flex-row gap-1">
                            <p @click="emits('setVideoTiming', parseFloat(item.start))"
                                class="hover:text-violet-500 hover:cursor-pointer">{{ timeConverter(item.start) }}</p>
                            <p>-</p>
                            <p @click="emits('setVideoTiming', parseFloat(item.end))"
                                class="hover:text-violet-500 cursor-pointer">{{ timeConverter(item.end) }}</p>
                        </div>
                        <p class="text-neutral-50">{{ item.text }}</p>
                    </div>
                </template>
            </ScrollPanel>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FileInfoResponse, TimecodeFile } from '@/models/fileSchema';
import { useEditorStore } from '@/stores/editor';

import ProgressBar from 'primevue/progressbar';
import { onMounted, ref, watch } from 'vue';
import Button from 'primevue/button';
import axios from 'axios';
import { useSSE } from '@/composables/useSSE';
import timeConverter from '@/utils/timeConverter';
import ScrollPanel from 'primevue/scrollpanel';
import { useTask } from '@/composables/useTask';
import { useRoute } from 'vue-router';

const editorStore = useEditorStore();
const sse = useSSE();
const tasks = useTask();
const route = useRoute();

const transcriptionItems = ref<TimecodeFile[]>([]);

const emits = defineEmits<{
    (e: "setVideoTiming", time: number): void
}>();

watch(() => editorStore.transcriptionFile, async (newValue, oldValue) => {
    if (oldValue === null && newValue !== null) {
        await downloadTranscription();
    }
})

onMounted(async () => {
    editorStore.project_id = route.params.id as string;
    await downloadTranscription();
})

const downloadTranscription = async () => {
    if (editorStore.project_data === null) {
        await editorStore.load_project_data(editorStore.project_id);
    }
    if (editorStore.project_data?.transcription_id === null) {
        await editorStore.load_project_data(editorStore.project_id);
    }
    if (editorStore.project_data?.transcription_id === null) {
        return;
    }
    await axios.get<TimecodeFile[]>(`/api/file/download/${editorStore.project_data?.transcription_id}`).then((response) => {
        response.data.forEach((item) => {
            transcriptionItems.value.push(item);
        });
    }).catch((e) => {
        console.log(e); //FIXME
    });
}
</script>