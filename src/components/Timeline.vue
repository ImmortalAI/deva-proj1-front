<template>
    <div ref="timelineRef" class="relative w-full h-20 px-5 bg-neutral-800 select-none cursor-pointer"
         @mousedown="onMouseDown"
         @mousemove="onMouseMove"
         @mouseup="onMouseUp"
         @mouseleave="onMouseUp"
         @dblclick="onDblClick">

        <!-- Progress bar -->
        <div v-if="currentTime > startTime && currentTime < endTime" class="absolute top-0 left-0 h-full bg-blue-500/50 pointer-events-none" :style="progressStyle" />

        <!-- Ticks -->
        <div v-for="(tick, idx) in ticks" :key="idx" class="absolute top-0 flex flex-col items-center transform -translate-x-1/2" :style="{ left: tick.left + 'px' }">
            <div class="w-px h-2 bg-pink-400"></div>
            <div class="text-[10px] text-neutral-100 mt-0.5 whitespace-nowrap">{{ formatTime(tick.time) }}</div>
        </div>

        <!-- Marks -->
        <div v-for="mark in markRects" :key="mark.id" class="absolute top-0 w-1 h-full bg-fuchsia-500/50 cursor-pointer" :style="{ left: mark.left + 'px' }" @click.stop="onMarkClick(mark.id)" />

        <!-- Selection rectangle -->
        <div v-if="isSelecting" class="absolute top-0 h-full bg-blue-500/30 border border-dashed border-blue-500 pointer-events-none" :style="selectionStyle" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

interface Props {
    currentTime: number;
    endTime: number;
    marks: {
        id: string;
        time: number;
    }[];
}

const props = defineProps<Props>();
const startTime = ref<number>(0);
const endTime = ref<number>(props.endTime);
const tickCount = ref<number>(10)
const currentTime = ref<number>(props.currentTime);

const emit = defineEmits(['create_note', 'mark_click'])

const timelineRef = ref<any>(null)
const width = ref(0)
const isSelecting = ref(false)
const startX = ref(0)
const currentX = ref(0)

function updateWidth() {
    if (timelineRef.value) width.value = timelineRef.value.clientWidth
}

let resizeObserver: ResizeObserver | null = null

onMounted(async () => {
    await nextTick()
    updateWidth()
    resizeObserver = new ResizeObserver(updateWidth)
    if (timelineRef.value) resizeObserver.observe(timelineRef.value)
    window.addEventListener('resize', updateWidth)
})

onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    window.removeEventListener('resize', updateWidth)
})

const ticks = computed(() => {
    const total = endTime.value - startTime.value
    return Array.from({ length: tickCount.value + 1 }, (_, i) => {
        const frac = i / tickCount.value
        return {
            time: startTime.value + frac * total,
            left: frac * width.value
        }
    })
})

const markRects = computed(() => {
    const total = endTime.value - startTime.value
    return props.marks
        .filter((m: any) => m.time >= startTime.value && m.time <= endTime.value)
        .map((m: any) => ({ id: m.id, left: ((m.time - startTime.value) / total) * width.value }))
})

const selectionStyle = computed(() => {
    const x = Math.min(startX.value, currentX.value)
    const w = Math.abs(currentX.value - startX.value)
    return { left: `${x}px`, width: `${w}px` }
})

const progressStyle = computed(() => {
    const total = endTime.value - startTime.value
    const frac = (props.currentTime - startTime.value) / total
    return { width: `${Math.max(0, Math.min(frac, 1)) * width.value}px` }
})

function xToTime(x: number): number {
    const clamped = Math.max(0, Math.min(x, width.value))
    return startTime.value + (clamped / width.value) * (endTime.value - startTime.value)
}

function formatTime(timeSec: number): string {
    const offset = Math.floor(timeSec - startTime.value)
    const hrs = Math.floor(offset / 3600)
    const mins = Math.floor((offset % 3600) / 60)
    const secs = offset % 60
    const pad = (n: number) => String(n).padStart(2, '0')
    return hrs > 0 ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`
}

function onMouseDown(e: MouseEvent) {
    isSelecting.value = true
    const rect = timelineRef.value!.getBoundingClientRect()
    startX.value = e.clientX - rect.left
    currentX.value = startX.value
}

function onMouseMove(e: MouseEvent) {
    if (!isSelecting.value) return
    const rect = timelineRef.value!.getBoundingClientRect()
    currentX.value = e.clientX - rect.left
}

function onMouseUp() {
    if (!isSelecting.value) return
    const [x1, x2] = [startX.value, currentX.value]
    if (Math.abs(x2 - x1) > 5) {
        const t1 = xToTime(x1), t2 = xToTime(x2)
        startTime.value = Math.min(t1, t2)
        endTime.value = Math.max(t1, t2)
    }
    isSelecting.value = false
}

function onDblClick(e: MouseEvent) {
    const rect = timelineRef.value!.getBoundingClientRect()
    emit('create_note', xToTime(e.clientX - rect.left))
}

function onMarkClick(id: string) {
    emit('mark_click', id)
}
</script>

<style scoped>
</style>
