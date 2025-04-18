<script lang="ts" setup>
import type { ProjectCreateResponse } from '@/models/projectScheme';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

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

const router = useRouter();

const divElement = ref<HTMLDivElement | null>(null)
const toRef = computed(() => `/edit/${props.idFile}`)

async function createProject(){
    const response = await fetch('/api/project/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: props.idFile})
    })
    if (response.ok) {
        const data = await response.json() as ProjectCreateResponse;
        router.push(`/edit/${data.id}`)
    }
}

onMounted(() => {
    if(props.idFile === '0') {
        divElement.value?.classList.add('border-dashed');
    }
})
</script>

<template>
    <div ref="divElement" class="w-full p-2 border-2 border-violet-900 rounded-2xl">
        <!-- <img class="mb-1 w-32 h-48 object-cover object-center" :src="props.imgFile || ''" alt="img"> -->
        <RouterLink v-if="props.idFile !== '0'" class="block w-full" :to="toRef"><span class="text-center block w-full">{{ props.nameFile }}</span></RouterLink>
        <a href="#" @click.prevent="createProject" v-else class="block w-full"><span class="text-center block w-full">{{ props.nameFile }}</span></a>
    </div>
</template>