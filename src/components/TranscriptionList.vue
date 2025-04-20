<script setup lang="ts">
import { useTask } from '@/composables/useTask';
import type { FileInfoResponse, TimecodeFile } from '@/models/fileScheme';
import { useEditorStore } from '@/stores/editor';

import { reactive, ref, watch, type PropType } from 'vue';
import Button from 'primevue/button';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';

const editorStore = useEditorStore();
const { createTask, taskId, taskState, taskProgressPercentage, taskResult } = useTask();

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

const transcriptionItems = reactive<TimecodeFile[]>([]);
watch(taskResult, () => {
    if (taskState.value === 'done') {
        //TODO: fetch file from minio
    }
})
</script>

<template>
    <div v-if="taskState !== 'done'" class="w-full h-full flex items-center justify-center">
        <Button v-if="taskState === 'not_started'" @click="createTask(props.fileId, 'transcribe')" class="w-fit h-fit p-0 rounded-full" >Транскрибировать</Button>
        <p v-else>{{ taskProgressPercentage }}%</p>
    </div>
    <div v-else class="flex flex-col">
        <div v-for="(item, index) in transcriptionItems" :key="index" @click="setActive(index)">
          <h3>{{ item.start }} - {{ item.end }}</h3>
          <p>{{ item.data }}</p>
        </div>
      </div>
</template>