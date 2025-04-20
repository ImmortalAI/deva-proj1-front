<script lang="ts" setup>
import type { ProjectCreateRequest, ProjectCreateResponse } from '@/models/projectScheme';
import axios from 'axios';
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

async function createProject() {
    const request: ProjectCreateRequest = {
        name: props.nameFile,
        description: '',
    }
    try {
        const response = await axios.post('/api/project/create', request);
        if (response.status === 200) {
            const data = response.data as ProjectCreateResponse;
            router.push(`/edit/${data.id}`);
        }
    } catch (e) {
        console.log(e); //FIXME
    }
}

onMounted(() => {
    if (props.idFile === '0') {
        divElement.value?.classList.add('border-dashed');
    }
})
</script>

<template>
    <div ref="divElement" class="w-full p-2 border-2 border-violet-900 rounded-2xl">
        <RouterLink v-if="props.idFile !== '0'" class="block w-full" :to="toRef"><span
                class="text-center block w-full">{{ props.nameFile }}</span></RouterLink>
        <a href="#" @click.prevent="createProject" v-else class="block w-full"><span class="text-center block w-full">{{
            props.nameFile }}</span></a>
    </div>
</template>