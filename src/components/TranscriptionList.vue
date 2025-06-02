<template>
    <div class="bg-neutral-800">
        <div v-if="editorStore.transcriptionFile == null" class="w-full h-full flex items-center justify-center">
            <Button v-if="editorStore.taskState === 'not_started'" :disabled="editorStore.mediaFile == null"
                @click="editorStore.createTask({ task_type: 'transcribe', prompt: '' })"
                class="w-fit h-fit p-0 rounded-full">Транскрибировать</Button>
            <div class="w-4/5" v-else>
                <p>Обработка...</p>
                <ProgressBar :mode="editorStore.transcribeTaskProgress == 0 ? 'indeterminate' : 'determinate'"
                    :value="editorStore.transcribeTaskProgress">{{ Math.floor(editorStore.transcribeTaskProgress) }} %
                </ProgressBar>
            </div>
        </div>
        <div v-else class="h-full">
            <ScrollPanel style="width: 100%; height: 100%">
                <template v-for="item, ind in transcriptionItems">
                    <div :class="[{ 'bg-neutral-900': ind % 2 === 1 }]" class="p-2">
                        <div class="text-xs text-primary-400 flex flex-row gap-1">
                            <p @click="emits('setVideoTiming', parseFloat(item.start))"
                                class="hover:text-primary-300 hover:cursor-pointer">{{ timeConverter(item.start) }}</p>
                            <p>-</p>
                            <p @click="emits('setVideoTiming', parseFloat(item.end))"
                                class="hover:text-primary-300 cursor-pointer">{{ timeConverter(item.end) }}</p>
                        </div>
                        <p class="text-neutral-50">{{ item.text }}</p>
                    </div>
                </template>
            </ScrollPanel>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { TimecodeFile } from '@/models/fileSchema';
import { useEditorStore } from '@/stores/editor';
import { onMounted, ref, watch } from 'vue';
import axiosI from '@/utils/axiosInstance'
import timeConverter from '@/utils/timeConverter';
import { useRoute } from 'vue-router';
import type { ErrorResponse } from '@/models/errorSchema';
import { showAxiosErrorToast } from '@/utils/toastService';

const editorStore = useEditorStore();
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
    await axiosI.get<TimecodeFile[]>(`/file/download/${editorStore.project_data?.transcription_id}`).then((response) => {
        response.data.forEach((item) => {
            transcriptionItems.value.push(item);
        });
    }).catch((e) => {
        showAxiosErrorToast<ErrorResponse>(e);
    });
}
</script>