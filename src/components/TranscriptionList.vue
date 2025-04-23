<template>
    <div class="bg-neutral-800">
        <div v-if="editorStore.taskState !== 'done'" class="w-full h-full flex items-center justify-center">
            <Button v-if="editorStore.taskState === 'not_started'"
                @click="createTask({ file_id: props.fileId, task_type: 'transcribe' })"
                class="w-fit h-fit p-0 rounded-full">Транскрибировать</Button>
            <p v-else>{{ editorStore.taskProgressPercentage }}%</p>
        </div>
        <div v-else class="h-full">
            <ScrollPanel style="width: 100%; height: 100%">
                <template v-for="item, ind in transcriptionItems">
                    <div :class="[{ 'bg-neutral-900': ind % 2 === 1 }]" class="p-2">
                        <div class="text-xs text-violet-600 flex flex-row gap-1">
                            <p @click="emits('setVideoTiming', parseFloat(item.start))" class="hover:text-violet-500 hover:cursor-pointer">{{ timeConverter(item.start) }}</p>
                            <p>-</p>
                            <p @click="emits('setVideoTiming', parseFloat(item.end))" class="hover:text-violet-500 cursor-pointer">{{ timeConverter(item.end) }}</p>
                        </div>
                        <p class="text-neutral-50">{{ item.text }}</p>
                    </div>
                </template>
            </ScrollPanel>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FileFullInfoResponse, FileInfoResponse, TimecodeFile } from '@/models/fileScheme';
import { useEditorStore } from '@/stores/editor';

import { onBeforeMount, onMounted, reactive, ref, watch, type PropType } from 'vue';
import Button from 'primevue/button';
import axios from 'axios';
import { useSSE } from '@/composables/useSSE';
import type { TaskCreateRequest, TaskCreateResponse } from '@/models/taskScheme';
import timeConverter from '@/utils/timeConverter';
import ScrollPanel from 'primevue/scrollpanel';

const editorStore = useEditorStore();
const sse = useSSE();

const props = defineProps({
    fileId: {
        type: String,
        required: true,
    },
    transcriptionFound: {
        type: Boolean,
        required: false,
    }
})

const emits = defineEmits<{
        (e: "setVideoTiming", time: number): void
}>();

watch(() => props.transcriptionFound, () => {
    if (props.transcriptionFound) {
        editorStore.taskState = 'done';
        downloadTranscription();
    }
})

const createTask = async (taskCR: TaskCreateRequest) => {
    if (editorStore.taskState !== "not_started") {
        console.error("Task already in progress");
        return;
    }

    try {
        const response = await axios.post<TaskCreateResponse>(
            "/api/task/create",
            {},
            {
                params: taskCR,
            }
        );
        editorStore.taskId = response.data.task_id;
        sse.sseConnect(`/api/sse/${editorStore.taskId}`);
        editorStore.taskState = "in_progress";
    } catch (e) {
        console.log(e); //FIXME
    }
};

watch(sse.sseData, async (newValue) => {
    if (newValue === null) return;
    if (newValue.done) {
        try {
            const response = await axios.get<FileInfoResponse[]>(
                `/api/task/get/${editorStore.taskId}`
            );
            response.data.forEach((file) => {
                editorStore.taskResult.push(file);
            });
            editorStore.taskState = "done";
            sse.sseDisconnect();
            await downloadTranscription();
        } catch (e) {
            console.log(e); //FIXME
        }
    } else {
        editorStore.taskProgressPercentage = (
            parseFloat(newValue.status ?? "0") * 100
        ).toFixed(0);
    }
});

const transcriptionItems = ref<TimecodeFile[]>([]);
const downloadTranscription = async () => {
    await axios.get<TimecodeFile[]>(`/api/file/download/${editorStore.taskResult[0].id}`).then((response) => {
        response.data.forEach((item) => {
            transcriptionItems.value.push(item);
        });
    }).catch((e) => {
        console.log(e); //FIXME
    });
}
</script>