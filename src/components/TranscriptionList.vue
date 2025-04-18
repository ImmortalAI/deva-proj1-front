<script setup lang="ts">
import { useSSE } from '@/composables/useSSE';
import { useTask } from '@/composables/useTask';
import type { FileInfoResponse, TimecodeFile } from '@/models/fileScheme';
import type { TaskCreateRequest, TaskInfoRequest, TaskTypes } from '@/models/taskScheme';
import { useEditorStore } from '@/stores/editor';
import Button from 'primevue/button';
import { ref, watch, type PropType } from 'vue';

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

const transcriptionItems = ref<TimecodeFile[]>([]);
</script>

<template>
    <div v-if="taskState !== 'done'" class="w-full flex items-center justify-center">
        <Button v-if="!taskState" @click="createTask(props.fileId, 'transcribe')" class="w-12 h-12 p-0 rounded-full" >Транскрибировать</Button>
        <p v-else>{{ taskProgressPercentage }}%</p>
    </div>
    <div v-else class="flex flex-col">
        <div v-for="(item, index) in transcriptionItems" :key="index" @click="setActive(index)">
          <h3>{{ item.start }} - {{ item.end }}</h3>
          <p>{{ item.data }}</p>
          <!-- <InputGroup v-if="inEditIndex === index">
            <InputGroupAddon>
              <Button icon="pi pi-check" @click="saveTranscription" />
            </InputGroupAddon>
            <InputText v-model="item.content" />
            <InputGroupAddon>
              <i class="pi pi-times"></i>
            </InputGroupAddon>
          </InputGroup>
          <div v-else>
            <p>{{ item.content }}</p>
            <i class="pi pi-pencil" @click="setEdit(index)"></i>
          </div> -->
        </div>
      </div>
</template>