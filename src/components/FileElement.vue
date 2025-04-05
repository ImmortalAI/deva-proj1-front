<script lang="ts" setup>
const props = defineProps({
    imgFile: String,
    nameFile: String,
});
</script>

<template>
    <div class="flex flex-col items-center w-fit p-2">
        <img class="mb-1 w-32 h-48 object-cover object-center" :src="props.imgFile" alt="img">
        <p>{{ props.nameFile }}</p>
    </div>
</template>