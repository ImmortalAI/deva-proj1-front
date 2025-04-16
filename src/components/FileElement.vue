<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

const props = defineProps({
    nameFile: {
        type: String,
        required: true
    },
    idFile: {
        type: String,
        required: true
    },
});

const divElement = ref<HTMLDivElement | null>(null)
const toRef = computed(() => props.idFile === '0' ? '/create' : `/edit/${props.idFile}`)

onMounted(() => {
    if(props.idFile === '0') {
        divElement.value?.classList.add('border-dashed');
    }
})
</script>

<template>
    <div ref="divElement" class="w-full p-2 border-2 border-violet-900 rounded-2xl">
        <!-- <img class="mb-1 w-32 h-48 object-cover object-center" :src="props.imgFile || ''" alt="img"> -->
        <RouterLink class="block w-full" :to="toRef"><span class="text-center block w-full">{{ props.nameFile }}</span></RouterLink>
    </div>
</template>