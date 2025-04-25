<template>
  <div ref="timelineRef" class="timeline" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp"
    @mouseleave="onMouseUp" @dblclick="onDblClick">
    <div class="scale">
      <div v-if="currentTime > startTime && currentTime < endTime" class="progress" :style="progressStyle"></div>
      <div v-for="mark in markRects" :key="mark.id" class="mark" :style="{ left: mark.left + 'px' }"
        @click.stop="onMarkClick(mark.id)"></div>
      <div v-for="(tick, idx) in ticks" :key="idx" class="tick" :style="{ left: tick.left + 'px' }">
        <div class="tick-line"></div>
        <div class="tick-label">{{ formatTime(tick.time) }}</div>
      </div>
    </div>

    <div v-if="isSelecting" class="selection" :style="selectionStyle"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  startTime: { type: Number, default: 0 },
  endTime: { type: Number, default: 3600 },
  tickCount: { type: Number, default: 10 },
  currentTime: { type: Number, default: 0 },
  marks: { type: Array, default: () => [] }
})
const emit = defineEmits(['create_note', 'mark_click'])

const timelineRef = ref(null)
const width = ref(0)
const isSelecting = ref(false)
const startX = ref(0)
const currentX = ref(0)

function updateWidth() {
  if (timelineRef.value) width.value = timelineRef.value.clientWidth
}

let resizeObserver
onMounted(async () => {
  await nextTick()
  updateWidth()
  resizeObserver = new ResizeObserver(updateWidth)
  if (timelineRef.value) resizeObserver.observe(timelineRef.value)
  window.addEventListener('resize', updateWidth)
})

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect()
  window.removeEventListener('resize', updateWidth)
})

const ticks = computed(() => {
  const total = props.endTime - props.startTime
  return Array.from({ length: props.tickCount + 1 }, (_, i) => {
    const frac = i / props.tickCount
    return { time: props.startTime + frac * total, left: frac * width.value }
  })
})

const markRects = computed(() => {
  const total = props.endTime - props.startTime
  return props.marks
    .filter(m => m.time >= props.startTime && m.time <= props.endTime)
    .map(m => ({ id: m.id, left: ((m.time - props.startTime) / total) * width.value }))
})

const selectionStyle = computed(() => {
  const x = Math.min(startX.value, currentX.value)
  const w = Math.abs(currentX.value - startX.value)
  return { left: x + 'px', width: w + 'px', top: '0px', height: '100%' }
})

const progressStyle = computed(() => {
  const total = props.endTime - props.startTime
  const frac = (props.currentTime - props.startTime) / total
  return { left: '0px', width: `${Math.max(0, Math.min(frac, 1)) * width.value}px`, top: '0px', height: '100%' }
})

function xToTime(x) {
  const clamped = Math.max(0, Math.min(x, width.value))
  return props.startTime + (clamped / width.value) * (props.endTime - props.startTime)
}

function formatTime(timeSec) {
  const offset = Math.floor(timeSec - props.startTime)
  const hrs = Math.floor(offset / 3600)
  const mins = Math.floor((offset % 3600) / 60)
  const secs = offset % 60
  const pad = n => String(n).padStart(2, '0')
  return hrs > 0 ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`
}

function onMouseDown(e) {
  isSelecting.value = true
  const rect = timelineRef.value.getBoundingClientRect()
  startX.value = e.clientX - rect.left
  currentX.value = startX.value
}

function onMouseMove(e) {
  if (!isSelecting.value) return
  const rect = timelineRef.value.getBoundingClientRect()
  currentX.value = e.clientX - rect.left
}

function onMouseUp() {
  if (!isSelecting.value) return
  const [x1, x2] = [startX.value, currentX.value]
  if (Math.abs(x2 - x1) > 5) {
    const t1 = xToTime(x1), t2 = xToTime(x2)
    props.startTime = Math.min(t1, t2)
    props.endTime = Math.max(t1, t2)
  }
  isSelecting.value = false
}

function onDblClick(e) {
  const rect = timelineRef.value.getBoundingClientRect()
  emit('create_note', xToTime(e.clientX - rect.left))
}

function onMarkClick(id) {
  emit('mark_click', id)
}
</script>

<style scoped>
.timeline {
  position: relative;
  width: 100%;
  height: 80px;
  padding: 0 20px;
  box-sizing: border-box;
  background: var(--color-neutral-800);
  user-select: none;
  cursor: pointer;
}

.scale {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.tick {
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateX(-50%);
}

.tick-line {
  width: 1px;
  height: 8px;
  background: #ab7777;
}

.tick-label {
  margin-top: 2px;
  font-size: 10px;
  color: var(--color-neutral-100);
  white-space: nowrap;
}

.mark {
  position: absolute;
  top: 0;
  width: 4px;
  height: 100%;
  background: rgba(255, 0, 255, 0.5);
  cursor: pointer;
}

.progress {
  position: absolute;
  background: rgba(0, 123, 255, 0.5);
  pointer-events: none;
}

.selection {
  position: absolute;
  background: rgba(0, 123, 255, 0.3);
  border: 1px dashed #007bff;
  pointer-events: none;
}
</style>