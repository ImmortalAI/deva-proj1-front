<template>
    <div class="bg-neutral-800">
        <div v-if="!editorStore.isTranscriptionFileExist" class="w-full h-full flex items-center justify-center">
            <Button v-if="editorStore.taskState === 'not_started'" :disabled="editorStore.mediaFileId === ''"
                @click="tasks.createTask({ project_id: editorStore.projectId, task_type: 'transcribe', prompt: '' })"
                class="w-fit h-fit p-0 rounded-full">Транскрибировать</Button>
            <p v-else>{{ tasks.totalTaskProgress }}%</p>
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

import { ref, watch } from 'vue';
import Button from 'primevue/button';
import axios from 'axios';
import { useSSE } from '@/composables/useSSE';
import type { TaskCreateRequest, TaskCreateResponse } from '@/models/taskSchema';
import timeConverter from '@/utils/timeConverter';
import ScrollPanel from 'primevue/scrollpanel';
import { useTask } from '@/composables/useTask';
import { fetchProjectFiles } from '@/utils/projectCRUD';

const editorStore = useEditorStore();
const sse = useSSE();
const tasks = useTask();

const transcriptionItems = ref<TimecodeFile[]>([]);

const emits = defineEmits<{
    (e: "setVideoTiming", time: number): void
}>();

watch(() => editorStore.transcriptionFileId, async (newValue, oldValue) => {
    if (oldValue === '' && newValue !== '') {
        await downloadTranscription();
    }
})

watch(() => editorStore.projectTranscriptionFileId, async (newValue, oldValue) => {
    if (oldValue === '' && newValue !== '') {
        await downloadTranscription();
    }
})

const downloadTranscription = async () => {
    if (editorStore.transcriptionFileId === '') {
        await fetchProjectFiles(editorStore.projectId).then((response) => {
            if (!response) return;
            const transcriptionFile = response.find((file) => file.id === editorStore.projectTranscriptionFileId);
            if (transcriptionFile) {
                editorStore.transcriptionFileId = transcriptionFile.id;
                editorStore.transcriptionFileName = transcriptionFile.file_name;
                editorStore.transcriptionFileMIMEType = transcriptionFile.file_type;
                editorStore.transcriptionFileCreatedDate = transcriptionFile.created_date;
                editorStore.transcriptionFileLastModifiedDate = transcriptionFile.last_modified_date;
            }
        })
    }
    await axios.get<TimecodeFile[]>(`/api/file/download/${editorStore.transcriptionFileId}`).then((response) => {
        response.data.forEach((item) => {
            transcriptionItems.value.push(item);
        });
    }).catch((e) => {
        console.log(e); //FIXME
    });
}
</script>