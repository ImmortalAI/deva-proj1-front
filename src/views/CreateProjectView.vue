<template>
    <div>
        <p>Загрузить...</p>
        <div>
            <p>Видео</p>
            <FileUploader mime_types="video/*" :on-file-selected="videoHandler" />
        </div>
        <span>ИЛИ</span>
        <div>
            <p>Аудио</p>
            <FileUploader mime_types="audio/*" :on-file-selected="audioHandler" />
        </div>
    </div>
</template>

<script setup lang="ts">
import FileUploader from '@/components/FileUploader.vue';

const videoHandler = (videoFile: File | null) => {

}

const audioHandler = (audioFile: File | null) => {

}
</script>