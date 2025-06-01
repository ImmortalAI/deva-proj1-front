<template>
  <div class="w-full h-full flex flex-col">
    <Dialog :visible="dialogSaveVisible" header="Добавление заметки" :style="{ width: '25rem' }" :position="'top'" modal
      :draggable="false" :closable="false">
      <div class="flex items-center gap-4 mb-4">
        <label for="proj-name" class="font-semibold w-24">Время заметки</label>
        <InputText id="proj-name" class="flex-auto" autocomplete="off" :model-value="numberToTimeStr(createdNoteTime)"
          disabled></InputText>
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="proj-description" class="font-semibold w-24">Текст заметки</label>
        <InputText id="proj-description" class="flex-auto" autocomplete="off" v-model="createdNoteText" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Отменить" severity="secondary" @click="cancelNoteCreate"></Button>
        <Button type="button" label="Создать" @click="saveNote"></Button>
      </div>
    </Dialog>
    <Dialog :visible="dialogUpdateVisible" header="Создание проекта" :style="{ width: '25rem' }" :position="'top'" modal
      :draggable="false" :closable="false">
      <span class="text-neutral-500 dark:text-neutral-400 block mb-8">Добавление заметки.</span>
      <div class="flex items-center gap-4 mb-4">
        <label for="proj-name" class="font-semibold w-24">Время заметки</label>
        <InputText id="proj-name" class="flex-auto" autocomplete="off" :model-value="numberToTimeStr(createdNoteTime)"
          disabled></InputText>
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="proj-description" class="font-semibold w-24">Текст заметки</label>
        <InputText id="proj-description" class="flex-auto" autocomplete="off" v-model="createdNoteText" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Удалить" severity="danger" @click="deleteCurrentNote"></Button>
        <Button type="button" label="Отменить" severity="secondary" @click="cancelNoteCreate"></Button>
        <Button type="button" label="Сохранить" @click="updateCurrentNote"></Button>
      </div>
    </Dialog>

    <video
        ref="videoRef"
        class="max-w-full max-h-4/5 w-full h-4/5"
        controls
        @loadedmetadata="onLoadedMetadata"
    >
      <source
          v-for="(source, index) in props.video_sources"
          :key="index"
          :src="source.src"
          :type="source.type"
      />
      Your browser does not support the video tag.
    </video>

    <div class="flex flex-col p-4 items-center">
      <Timeline :currentTime="currentTime" :endTime="duration" :marks="timeline_notes" @create_note="addNote"
        @mark_click="clickNote"></Timeline>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { InputText } from 'primevue';
import { useMediaControls } from '@vueuse/core';
// @ts-ignore
import Timeline from '@/components/Timeline.vue';
import { useEditorStore } from '@/stores/editor';
import { createNote, deleteNote, updateNote } from '@/utils/projectCRUD';

interface Props {
  video_sources: { src: string, type: string }[];
}

const props = defineProps<Props>();
const emits = defineEmits(['moveStart', 'moveEnd']);

const dialogSaveVisible = ref(false);
const dialogUpdateVisible = ref(false);
const editorStore = useEditorStore();

const createdNoteText = ref('');
const createdNoteTime = ref(0);
const updateNoteId = ref('');

const videoRef = ref<HTMLVideoElement | null>(null);
const { currentTime: mediaCurrentTime, duration: mediaDuration } = useMediaControls(videoRef);

const currentTime = computed({
  get: () => mediaCurrentTime.value ?? 0,
  set: (val: number) => {
    mediaCurrentTime.value = val;
  }
});

const duration = computed(() => mediaDuration.value ?? 0);

const onLoadedMetadata = () => {
  resetBoundaries();
};

const timeline_notes = computed(() =>
    editorStore.notes.map(note => ({ id: note.id, time: note.start_time_code }))
);

function addNote(time: number) {
  if (!editorStore.mediaFile) return;
  createdNoteTime.value = time;
  createdNoteText.value = '';
  dialogSaveVisible.value = true;
}

function clickNote(id: string) {
  const note = editorStore.notes.find(n => n.id === id);
  if (!note) return;
  createdNoteTime.value = note.start_time_code;
  createdNoteText.value = note.text;
  updateNoteId.value = id;
  dialogUpdateVisible.value = true;
}

async function deleteCurrentNote() {
  if (!editorStore.mediaFile) return;
  await deleteNote(updateNoteId.value);
  dialogUpdateVisible.value = false;
  await editorStore.load_notes(editorStore.mediaFile.id);
}

async function saveNote() {
  if (!editorStore.mediaFile) return;
  await createNote({
    file_id: editorStore.mediaFile.id,
    text: createdNoteText.value,
    start_time_code: createdNoteTime.value,
    end_time_code: createdNoteTime.value
  });
  dialogSaveVisible.value = false;
  await editorStore.load_notes(editorStore.mediaFile.id);
}

async function updateCurrentNote() {
  if (!editorStore.mediaFile) return;
  await updateNote(updateNoteId.value, { text: createdNoteText.value });
  dialogUpdateVisible.value = false;
  await editorStore.load_notes(editorStore.mediaFile.id);
}

function cancelNoteCreate() {
  createdNoteText.value = '';
  createdNoteTime.value = 0;
  dialogSaveVisible.value = false;
  dialogUpdateVisible.value = false;
}

const timeStrToNumber = (time: string): number => {
  const [h, m, s] = time.split(':').map(Number);
  return h * 3600 + m * 60 + s;
};

const numberToTimeStr = (seconds: number): string => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const isValidTime = (val: string) => /^\d{1,2}:\d{2}:\d{2}$/.test(val);

const pointer = ref(0);
watch(pointer, val => currentTime.value = val);

const rawStart = ref(0);
const rawEnd = ref(0);

const startStr = ref('00:00:00');
const endStr = ref('00:00:00');

const lastValidStart = ref(startStr.value);
const lastValidEnd = ref(endStr.value);

const resetBoundaries = () => {
  rawStart.value = 0;
  rawEnd.value = duration.value;
  startStr.value = numberToTimeStr(0);
  endStr.value = numberToTimeStr(duration.value);
  lastValidStart.value = startStr.value;
  lastValidEnd.value = endStr.value;
};

watch(startStr, newVal => {
  if (isValidTime(newVal)) {
    const seconds = timeStrToNumber(newVal);
    if (seconds >= 0 && seconds < rawEnd.value && seconds <= duration.value) {
      rawStart.value = seconds;
      lastValidStart.value = newVal;
      emits('moveStart', seconds);
      return;
    }
  }
  startStr.value = lastValidStart.value;
});

watch(endStr, newVal => {
  if (isValidTime(newVal)) {
    const seconds = timeStrToNumber(newVal);
    if (seconds <= duration.value && seconds > rawStart.value) {
      rawEnd.value = seconds;
      lastValidEnd.value = newVal;
      emits('moveEnd', seconds);
      return;
    }
  }
  endStr.value = lastValidEnd.value;
});

defineExpose({
  setVideoTimecode: (seconds: number) => {
    currentTime.value = seconds;
  }
});
</script>
