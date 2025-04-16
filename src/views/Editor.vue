<script setup lang="ts">
import type { FileUploadSelectEvent } from 'primevue';
import { ref } from 'vue';
import FileUpload from 'primevue/fileupload';

const videoElement = ref < HTMLVideoElement | null > (null);

function onFileSelect(event: FileUploadSelectEvent) {
    const file = event.files[0];
}
</script>

<template>
    <div class="w-full grid grid-cols-[60%_40%] grid-rows-2 gap-4 p-4">
        <div class="space-y-4">
            <FileUpload mode="basic" accept="video/*" custom-upload auto choose-label="Загрузить видео"
                @select="onFileSelect" />
            <video class="hidden" ref="videoElement"></video>
        </div>
    </div>
</template>