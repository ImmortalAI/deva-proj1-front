<template>
  <div class="w-full h-full flex flex-col">
    <video-player :sources="props.video_sources" controls :class="['max-w-full', 'max-h-4/5', 'w-full', 'h-4/5']"
      v-model:currentTime="currentTime" v-bind:duration="duration" @mounted="handleMounted">
    </video-player>
    <div class="flex flex-col p-4 items-center">
      <timeline
      :currentTime="currentTime"
      :endTime="duration"
      :marks="notes"
      @create_note="addNote"
      @mark_click="clickNote"
      ></timeline>
    </div>
  </div>

</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Slider from 'primevue/slider';
import InputMask from 'primevue/inputmask';
import Button from 'primevue/button';
import { VideoPlayer, type VideoPlayerState} from '@videojs-player/vue'
// @ts-ignore
import Timeline from '@/components/Timeline.vue'; 


import videojs from 'video.js'
type VideoJsPlayer = ReturnType<typeof videojs>

interface Props {
  video_sources: object[]
}

const notes = ref<Object[]>([]);

function addNote(time: number) {
  notes.value.push({
    time: time,
    id: notes.value.length
  })
}

function clickNote(id: number) {
  alert(id)
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
