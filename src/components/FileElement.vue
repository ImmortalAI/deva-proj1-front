<template>
    <div ref="divElement" class="w-full p-2 border-2 border-violet-900 rounded-2xl">
        <a href="#" @click.prevent="openProject" class="block w-full"><span class="text-center block w-full">{{
            props.nameFile }}</span></a>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
    nameFile: {
        type: String,
        required: true
    },
    descriptionFile: {
        type: String,
        required: true
    },
    idFile: {
        type: String,
        required: true
    },
});

const router = useRouter();

const divElement = ref<HTMLDivElement | null>(null)

const openProject = () => {
    router.push(`/edit/${props.idFile}`);
}
</script>