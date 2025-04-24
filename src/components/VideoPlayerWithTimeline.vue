<template>
  <div class="w-full h-full flex flex-col">
    <Dialog :visible="dialogSaveVisible" header="Создание проекта" :style="{ width: '25rem' }" :position="'top'" modal
      :draggable="false" :closable="false">
      <span class="text-neutral-500 dark:text-neutral-400 block mb-8">Добавление заметки.</span>
      <div class="flex items-center gap-4 mb-4">
        <label for="proj-name" class="font-semibold w-24">Время заметки</label>
        <InputText id="proj-name" class="flex-auto" autocomplete="off" :model-value="numberToTimeStr(createdNoteTime)" disabled></InputText>
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="proj-description" class="font-semibold w-24">Текст заметки</label>
        <InputText id="proj-description" class="flex-auto" autocomplete="off" v-model="createdNoteText" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancel" severity="secondary" @click="cancelNoteCreate"></Button>
        <Button type="button" label="Save" @click="saveNote"></Button>
      </div>
    </Dialog>
    <Dialog :visible="dialogUpdateVisible" header="Создание проекта" :style="{ width: '25rem' }" :position="'top'" modal
      :draggable="false" :closable="false">
      <span class="text-neutral-500 dark:text-neutral-400 block mb-8">Добавление заметки.</span>
      <div class="flex items-center gap-4 mb-4">
        <label for="proj-name" class="font-semibold w-24">Время заметки</label>
        <InputText id="proj-name" class="flex-auto" autocomplete="off" :model-value="numberToTimeStr(createdNoteTime)" disabled></InputText>
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="proj-description" class="font-semibold w-24">Текст заметки</label>
        <InputText id="proj-description" class="flex-auto" autocomplete="off" v-model="createdNoteText" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Delete" severity="Danger" @click="deleteCurrentNote"></Button>
        <Button type="button" label="Cancel" severity="secondary" @click="cancelNoteCreate"></Button>
        <Button type="button" label="Save" @click="updateCurrentNote"></Button>
      </div>
    </Dialog>
    <video-player :sources="props.video_sources" controls :class="['max-w-full', 'max-h-4/5', 'w-full', 'h-4/5']"
      v-model:currentTime="currentTime" v-bind:duration="duration" @mounted="handleMounted">
    </video-player>
    <div class="flex flex-col p-4 items-center">
      <timeline :currentTime="currentTime" :endTime="duration" :marks="timeline_notes" @create_note="addNote"
        @mark_click="clickNote"></timeline>
    </div>
  </div>

</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Slider from 'primevue/slider';
import InputMask from 'primevue/inputmask';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { InputText } from 'primevue';
import { VideoPlayer, type VideoPlayerState } from '@videojs-player/vue'
// @ts-ignore
import Timeline from '@/components/Timeline.vue';
import videojs from 'video.js'
import { useEditorStore } from '@/stores/editor';
import { createNote, deleteNote, updateNote } from '@/utils/projectCRUD';

type VideoJsPlayer = ReturnType<typeof videojs>

const dialogSaveVisible = ref(false);
const dialogUpdateVisible = ref(false);
const editorStore = useEditorStore();




interface Props {
  video_sources: object[]
}

const notes = ref<Object[]>([]);
const createdNoteText = ref<string>('');
const createdNoteTime = ref<number>(0);
const updateNoteId = ref<string>('');


const timeline_notes = computed(() => {
  return editorStore.notes.map((note) => { return { id: note.id, time: note.start_time_code } });
})

function addNote(time: number) {
  if (editorStore.mediaFile == null) return;
  createdNoteTime.value = time
  createdNoteText.value = '';
  dialogSaveVisible.value = true;
}

function clickNote(id: string) {
  if (editorStore.mediaFile == null) return;
  const note = editorStore.notes.find((note) => note.id === id);
  if (note == null) return;
  createdNoteTime.value = note.start_time_code;
  createdNoteText.value = note.text;
  updateNoteId.value = id
  dialogUpdateVisible.value = true;
}

async function deleteCurrentNote(){
  if (editorStore.mediaFile == null) return;
  await deleteNote(updateNoteId.value);
  createdNoteTime.value = 0;
  createdNoteText.value = '';
  dialogUpdateVisible.value = false;
  await editorStore.load_notes(editorStore.mediaFile.id);
}

async function saveNote() {
  if (editorStore.mediaFile == null) return;
  await createNote({
    file_id: editorStore.mediaFile.id,
    text: createdNoteText.value,
    start_time_code: createdNoteTime.value,
    end_time_code: createdNoteTime.value
  })
  await editorStore.load_notes(editorStore.mediaFile.id);
  dialogSaveVisible.value = false;
}

async function updateCurrentNote() {
  if (editorStore.mediaFile == null) return;
  await updateNote(updateNoteId.value, {
    text: createdNoteText.value
  })
  dialogSaveVisible.value = false;
}

function cancelNoteCreate() {
  createdNoteText.value = '';
  createdNoteTime.value = 0;
  dialogSaveVisible.value = false;
  dialogUpdateVisible.value = false;
}


const state = ref<VideoPlayerState | null>(null)
const player = ref<VideoJsPlayer | null>(null)

const props = defineProps<Props>();

const emits = defineEmits<{
  (e: "moveStart", newStart: number): void;
  (e: "moveEnd", newEnd: number): void;
}>();

const handleMounted = (payload: any) => {
  state.value = payload.state
  player.value = payload.player
}

const timeStrToNumber = (time: string): number => {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return (hours * 3600) + (minutes * 60) + seconds;
};

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

const isValidTime = (val: string): boolean => {
  if (!/^\d{1,2}:\d{2}:\d{2}$/.test(val)) return false;
  const [h, m, s] = val.split(':').map(Number);
  return h >= 0 && h <= 99 && m >= 0 && m <= 59 && s >= 0 && s <= 59;
};

const duration = computed(() => {
  return state.value?.duration || 0;
});

watch(duration, () => {
  resetBoundaries();
});

const currentTime = computed({
  get: () => {
    return state.value?.currentTime || 0;
  },
  set: (val: number) => {
    if (!player.value) return;
    player.value.currentTime(val);
  }
});

const pointer = ref<number>(0);

const rawStart = ref<number>(0);
const rawEnd = ref<number>(duration.value);

const startStr = ref<string>(numberToTimeStr(0));
const endStr = ref<string>(numberToTimeStr(duration.value));

const lastValidStart = ref(startStr.value);
const lastValidEnd = ref(endStr.value);

const currentTimeStr = computed(() => {
  return numberToTimeStr(currentTime.value);
});


const resetBoundaries = () => {
  rawStart.value = 0;
  rawEnd.value = duration.value || 0;
  startStr.value = numberToTimeStr(0);
  endStr.value = numberToTimeStr(duration.value || 0);
  lastValidStart.value = startStr.value;
  lastValidEnd.value = endStr.value;
}

watch(pointer, (newVal) => {
  currentTime.value = newVal;
});

watch(startStr, (newVal) => {
  if (isValidTime(newVal)) {
    const seconds = timeStrToNumber(newVal);
    if (seconds >= 0 && seconds < rawEnd.value && seconds <= (duration.value || 0)) {
      rawStart.value = seconds;
      lastValidStart.value = newVal;
      emits("moveStart", seconds);
      return;
    }
  }
  startStr.value = lastValidStart.value;
});

watch(endStr, (newVal) => {
  if (isValidTime(newVal)) {
    const seconds = timeStrToNumber(newVal);
    if (seconds <= (duration.value || 0) && seconds > rawStart.value) {
      rawEnd.value = seconds;
      lastValidEnd.value = newVal;
      emits("moveEnd", seconds);
      return;
    }
  }
  endStr.value = lastValidEnd.value;
});
</script>
