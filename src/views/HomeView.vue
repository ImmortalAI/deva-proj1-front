<template>
  <Dialog :visible="dialogVisible" header="Создание проекта" :style="{ width: '25rem' }" :position="'top'" modal
    :draggable="false" :closable="false">
    <span class="text-neutral-500 dark:text-neutral-400 block mb-8">Введите информацию о проекте.</span>
    <div class="flex items-center gap-4 mb-4">
      <label for="proj-name" class="font-semibold w-24">Название проекта</label>
      <InputText id="proj-name" class="flex-auto" autocomplete="off" v-model="project_name" />
    </div>
    <div class="flex items-center gap-4 mb-4">
      <label for="proj-description" class="font-semibold w-24">Краткое описание</label>
      <InputText id="proj-description" class="flex-auto" autocomplete="off" v-model="project_description" />
    </div>
    <Message class="mb-8" size="small" severity="secondary" variant="simple">Описание необязательно.</Message>
    <div class="flex justify-end gap-2">
      <Button type="button" label="Отмена" severity="secondary" @click="cancelProjectInit"></Button>
      <Button type="button" label="Создать" @click="createProj"></Button>
    </div>
  </Dialog>
  <main class="ml-[10%] mr-[10%] mt-8">
    <div v-if="userStore.isAuthenticated">
      <h1 class="mb-8 text-2xl text-shadow-surface-600 text-center">Мои проекты</h1>
      <div class="w-full p-2 border-2 border-violet-900 rounded-2xl mb-8 border-dashed">
        <a href="#" @click.prevent="newProjectInit" class="block w-full">
          <span class="text-center block w-full">Создать новый проект</span>
        </a>
      </div>
      <div class="flex flex-col gap-4">
        <FileElement v-for="availableFile in availableProjects" :idFile="availableFile.id"
          :nameFile="availableFile.name" :descriptionFile="availableFile.description" />
      </div>
      <Divider/>
      <h1 class="mb-8 text-2xl text-shadow-surface-600 text-center">Проекты в коллаборации</h1>
      <div class="flex flex-col gap-4">
        <FileElement v-for="availableCollabFile in availableCollabProjects" :idFile="availableCollabFile.id"
          :nameFile="availableCollabFile.name" :descriptionFile="availableCollabFile.description" />
      </div>
    </div>
    <div v-else>
      <h1>Для начала работы войдите или зарегистрируйтесь.</h1>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/user';
import { fetchCollabProjectsList, fetchProjectsList } from '@/utils/projectCRUD';
import { useRouter } from 'vue-router';
import { createProject } from '@/utils/projectCRUD';
import type { ProjectCreateRequest, ProjectData } from '@/models/projectSchema';
import { useEditorStore } from '@/stores/editor';

const userStore = useUserStore();
const editorStore = useEditorStore();
const router = useRouter();

const availableProjects = ref<ProjectData[]>([]);
const availableCollabProjects = ref<ProjectData[]>([]);
const dialogVisible = ref(false);

const project_name = ref<string>('Новый проект');
const project_description = ref<string>('');


const newProjectInit = () => {
  project_name.value = "Новый проект";
  project_description.value = "";
  dialogVisible.value = true;
}

const cancelProjectInit = () => {
  editorStore.reset();
  dialogVisible.value = false;
}

const createProj = async () => {
  const request: ProjectCreateRequest = {
    name: project_name.value,
    description: project_description.value,
  }
  const info = await createProject(request);
  if (info) {
    router.push(`/edit/${info.id}`);
  } 
}

onMounted(async () => {
  if (userStore.isAuthenticated) {
    if (availableProjects.value.length > 1) {
      availableProjects.value = [];
    }
    (await fetchProjectsList()).forEach((project) => {
      availableProjects.value.push(project);
    });

    if (availableCollabProjects.value.length > 1) {
      availableCollabProjects.value = [];
    }
    (await fetchCollabProjectsList()).forEach((project) => {
      availableCollabProjects.value.push(project);
    });
  }
})
</script>
