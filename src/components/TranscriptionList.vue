<script setup lang="ts">
import type { FileFullInfoResponse, FileInfoResponse, TimecodeFile } from '@/models/fileScheme';
import { useEditorStore } from '@/stores/editor';

import { reactive, ref, watch, type PropType } from 'vue';
import Button from 'primevue/button';
import axios from 'axios';
import { useSSE } from '@/composables/useSSE';
import type { TaskCreateRequest, TaskCreateResponse } from '@/models/taskScheme';

const editorStore = useEditorStore();
const sse = useSSE();

const props = defineProps({
    fileId: {
        type: String,
        required: true
    },
    setActive: {
        type: Function as PropType<(index: number) => void>,
        required: true
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
            const response = await axios.get<FileFullInfoResponse[]>(
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

const transcriptionItems = reactive<TimecodeFile[]>([]);
const downloadTranscription = async () => {
    await axios.post<TimecodeFile[]>("/api/file/download_files",//FIXME: fix download link minio:SOMETHING
        [
            editorStore.taskResult[0].id,
        ]).then((response) => {
            response.data.forEach((item) => {
                transcriptionItems.push(item);
            });
            console.log(transcriptionItems);
        }).catch((e) => {
            console.log(e); //FIXME
        });
}
</script>

<template>
    <div v-if="editorStore.taskState !== 'done'" class="w-full h-full flex items-center justify-center">
        <Button v-if="editorStore.taskState === 'not_started'"
            @click="createTask({ file_id: props.fileId, task_type: 'transcribe' })"
            class="w-fit h-fit p-0 rounded-full">Транскрибировать</Button>
        <p v-else>{{ editorStore.taskProgressPercentage }}%</p>
    </div>
    <div v-else class="flex flex-col">
        <div v-for="(item, index) in transcriptionItems" :key="index" @click="setActive(index)">
            <h3>{{ item.start }} - {{ item.end }}</h3>
            <p>{{ item.text }}</p>
        </div>
    </div>
</template>