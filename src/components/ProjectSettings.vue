<template>
    <div>
        <div class="flex gap-4">
            <Card class="w-1/2 h-fit">
                <template #title>
                    Данные о проекте
                </template>
                <template #content>
                    <div class="flex flex-col gap-2">
                        <FloatLabel class="mt-4">
                            <InputText id="project_name" v-model="editorStore.project_data.name" class="w-full" />
                            <label for="project_name">Имя проекта</label>
                        </FloatLabel>
                        <FloatLabel class="mt-4">
                            <InputText id="project_description" v-model="editorStore.project_data.description" class="w-full" />
                            <label for="project_description">Описание проекта</label>
                        </FloatLabel>
                        <Button @click="saveProjectData" class="w-full">Сохранить</Button>
                    </div>
                </template>
            </Card>
            <Card class="w-1/2 h-fit">
                <template #title>
                    Коллаборация
                </template>
                <template #content>
                    <div class="flex flex-col gap-2">
                        <FloatLabel class="mt-4">
                            <InputText id="collaborator_name" v-model="newCollaboratorName" class="w-full" />
                            <label for="collaborator_name">Логин пользователя</label>
                        </FloatLabel>
                        <Button>Добавить пользователя</Button>
                        <Divider></Divider>
                        <DataTable :value="collaborators" tableStyle="min-width: 50rem">
                            <Column field="login" header="Логины коллабораторов"></Column>
                            <Column class="w-24 !text-end">
                                <template #body="{ data }">
                                    <Button icon="pi pi-times-circle" @click="deleteCollaborator(data.login)" severity="secondary" rounded></Button>
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useEditorStore } from "@/stores/editor";
import axiosI from "@/utils/axiosInstance";
import type { ProjectPatchRequest, ProjectPatchResponse } from "@/models/projectSchema";

const editorStore = useEditorStore();

const newCollaboratorName = ref('');

interface Collaborator {
    login: string;
}

const collaborators = ref<Collaborator[]>([]);

const saveProjectData = async () => {
    const patchRequest: ProjectPatchRequest = {
        name: editorStore.project_data.name,
        description: editorStore.project_data.description,
    }
    await axiosI.patch<ProjectPatchResponse>(`/project/${editorStore.project_id}`,
        patchRequest
    );
}

const addCollaborator = async () => {
    // TODO: add collaborator
}

onMounted(async () => {
    // TODO: fetch collaborators
})

const deleteCollaborator = async (login: string) => {
    // TODO: delete collaborator
}
</script>
