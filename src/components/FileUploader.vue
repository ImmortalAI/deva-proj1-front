<template>
    <div>
        <input type="file" ref="fileInput" :accept="mime_types" class="hidden" @change="handleFileUpload">

        <button type="button" @click="triggerFileInput"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            <slot>Выбрать файл</slot>
        </button>
    </div>
</template>

<script setup lang="ts" generic="T extends File | null">
import { ref, type PropType } from 'vue';

const props = defineProps({
    mime_types: {
        type: String,
        default: "*/*",
    },
    onFileSelected: {
        type: Function as PropType<(file: T) => void>,
        required: true,
    },
})

const fileInput = ref < HTMLInputElement | null > (null)

const triggerFileInput = () => {
    fileInput.value?.click()
}

const handleFileUpload = (e: Event) => {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0] || null

    if (file && !validateFileType(file)) {
        console.error(`Недопустимый тип файла. Ожидается: ${props.mime_types}`)
        resetInput()
        return
    }

    props.onFileSelected(file as T)
    resetInput()
}

const validateFileType = (file: File): boolean => {
    if (props.mime_types === '*/*') return true

    const acceptedTypes = props.mime_types
        .split(',')
        .map(type => type.trim().replace('/*', ''))

    return acceptedTypes.some(type => file.type.startsWith(type))
}

const resetInput = () => {
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}
</script>