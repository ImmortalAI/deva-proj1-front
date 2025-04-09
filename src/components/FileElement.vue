<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
    imgFile: {
        type: String,
    },
    nameFile: {
        type: String,
        required: true
    },
    idFile: {
        type: String,
        required: true
    },
});

const toRef = computed(() => props.idFile === '0' ? '/create' : `/edit/${props.idFile}`)
</script>

<template>
    <div class="flex flex-col items-center w-fit p-2">
        <img class="mb-1 w-32 h-48 object-cover object-center" :src="props.imgFile || ''" alt="img">
        <RouterLink :to="toRef">Открыть</RouterLink>
        <p>{{ props.nameFile }}</p>
    </div>
</template>