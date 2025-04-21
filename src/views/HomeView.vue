<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import FileElement from '@/components/FileElement.vue'
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { useUserStore } from '@/stores/user';
import { fetchProjects } from '@/utils/projectCRUD';
import { useRouter } from 'vue-router';
import { createProject } from '@/utils/projectCRUD';
import type { ProjectInfoResponse, ProjectCreateRequest } from '@/models/projectScheme';
import { useEditorStore } from '@/stores/editor';

const userStore = useUserStore();
const editorStore = useEditorStore();
const router = useRouter();

const availableProjects = ref<ProjectInfoResponse[]>([]);
const dialogVisible = ref(false);

const newProjectInit = () => {
  editorStore.projectName = "Новый проект";
  editorStore.projectDescription = "";
  dialogVisible.value = true;
}

const cancelProjectInit = () => {
  editorStore.reset();
  dialogVisible.value = false;
}

const createProj = async () => {
  const request: ProjectCreateRequest = {
    name: editorStore.projectName,
    description: editorStore.projectDescription,
  }
  const info = await createProject(request);
  if (info) {
    router.push(`/edit/${info.id}`);
  } else {
    console.log(request);
  }
}

onMounted(async () => {
  if (userStore.isAuthenticated) {
    if (availableProjects.value.length > 1) {
      availableProjects.value = [];
    }
    (await fetchProjects())?.forEach((project) => {
      availableProjects.value.push(project);
    })
  }
})
</script>

<template>
  <Dialog :visible="dialogVisible" header="Создание проекта" :style="{ width: '25rem' }" :position="'top'" modal
    :draggable="false" :closable="false">
    <span class="text-surface-500 dark:text-surface-400 block mb-8">Введите информацию о проекте.</span>
    <div class="flex items-center gap-4 mb-4">
      <label for="proj-name" class="font-semibold w-24">Название проекта</label>
      <InputText id="proj-name" class="flex-auto" autocomplete="off" v-model="editorStore.projectName" />
    </div>
    <div class="flex items-center gap-4 mb-8">
      <label for="proj-description" class="font-semibold w-24">Краткое описание</label>
      <InputText id="proj-description" class="flex-auto" autocomplete="off" v-model="editorStore.projectDescription" />
    </div>
    <div class="flex justify-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="cancelProjectInit"></Button>
      <Button type="button" label="Save" @click="createProj"></Button>
    </div>
  </Dialog>
  <main class="ml-[10%] mr-[10%] mt-8">
    <div v-if="userStore.isAuthenticated">
      <div class="w-full p-2 border-2 border-violet-900 rounded-2xl mb-8 border-dashed">
        <a href="#" @click.prevent="newProjectInit" class="block w-full">
          <span class="text-center block w-full">Создать новый проект</span>
        </a>
      </div>
      <div class="flex flex-col gap-4">
        <FileElement v-for="availableFile in availableProjects" :idFile="availableFile.id"
          :nameFile="availableFile.name" :descriptionFile="availableFile.description" />
      </div>
    </div>
    <div v-else>
      <h1>Для начала работы войдите или зарегистрируйтесь.</h1>
    </div>
  </main>
</template>
