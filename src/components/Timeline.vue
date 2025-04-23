<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import Slider from 'primevue/slider';
import InputMask from 'primevue/inputmask';

interface Props {
  videoLength: number;
}

const props = defineProps<Props>();

const emits = defineEmits<{
  (e: "movePointer", newMoment: number): void;
  (e: "moveStart", newStart: number): void;
  (e: "moveEnd", newEnd: number): void;
}>();

// Helpers
const timeStrToNumber = (time: string): number => {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return (hours * 3600) + (minutes * 60) + seconds;
};

const numberToTimeStr = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const remaining = seconds % 3600;
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
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

// Refs
const pointer = ref<number>(0);

const startStr = ref<string>(numberToTimeStr(0));
const endStr = ref<string>(numberToTimeStr(props.videoLength));

const lastValidStart = ref(startStr.value);
const lastValidEnd = ref(endStr.value);

// Computed model for current slider time
const currentTimeStr = computed({
  get: () => numberToTimeStr(pointer.value),
  set: (val: string) => {
    if (isValidTime(val)) {
      const seconds = timeStrToNumber(val);
      if (seconds >= start.value && seconds <= end.value) {
        pointer.value = seconds;
      }
    }
  }
});

watch(() => props.videoLength, () => {
  rawStart.value = 0;
  rawEnd.value = props.videoLength;
  emits('moveStart', 0);
  emits('moveEnd', props.videoLength);
})

// Emit pointer move
watch(pointer, (newVal) => {
  emits('movePointer', newVal);
});

const rawStart = ref<number>(0);
const rawEnd = ref<number>(props.videoLength);

const start = computed(() => rawStart.value);
const end = computed(() => rawEnd.value);

// In watcher
watch(startStr, (newVal) => {
  if (isValidTime(newVal)) {
    const seconds = timeStrToNumber(newVal);
    if (seconds >= 0 && seconds < rawEnd.value && seconds <= props.videoLength) {
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
    if (seconds <= props.videoLength && seconds > rawStart.value) {
      rawEnd.value = seconds;
      lastValidEnd.value = newVal;
      emits("moveEnd", seconds);
      return;
    }
  }
  endStr.value = lastValidEnd.value;
});
</script>

<template>
  <div class="flex flex-col p-4 items-center">
    <div class="flex items-center gap-4 w-full">
      <!-- Start Time Input -->
      <InputMask
          id="timeStart"
          v-model="startStr"
          mask="99:99:99"
          :placeholder="numberToTimeStr(0)"
          class="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-28"
      />
      <!-- Slider -->
      <Slider
          v-model="pointer"
          :min="start"
          :max="end"
          class="flex-1"
      />
      <!-- End Time Input -->
      <InputMask
          id="timeEnd"
          v-model="endStr"
          mask="99:99:99"
          :placeholder="numberToTimeStr(props.videoLength)"
          class="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-28"
      />
    </div>
    <!-- Optional current time display -->
    <p class="mt-2 text-sm">{{ currentTimeStr }}</p>
  </div>
</template>

<style scoped>
</style>
