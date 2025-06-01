<template>
    <div>
        <div class="flex gap-4">
            <div class="flex flex-col gap-4 w-1/2">
                <Card class="w-full h-fit">
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
                                <InputText id="project_description" v-model="editorStore.project_data.description"
                                    class="w-full" />
                                <label for="project_description">Описание проекта</label>
                            </FloatLabel>
                            <Button @click="saveProjectData" class="w-full">Сохранить</Button>
                        </div>
                    </template>
                </Card>
                <Button severity="danger" class="w-full" @click="deleteProject">Удалить проект</Button>
            </div>
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
                        <Button @click="addCollaborator">Добавить пользователя</Button>
                        <Divider></Divider>
                        <DataTable :value="collaborators" tableStyle="min-width: 50rem">
                            <Column field="login" header="Логины коллабораторов"></Column>
                            <Column class="w-24 !text-end">
                                <template #body="{ data }">
                                    <Button icon="pi pi-times-circle" @click="deleteCollaborator(data.login)"
                                        severity="secondary" rounded></Button>
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
import type { ProjectShareGetResponse, ProjectCollaboratorData, ProjectPatchRequest, ProjectPatchResponse, ProjectSharePostRequest } from "@/models/projectSchema";
import { useToast } from 'primevue/usetoast';
import type { ProjectDeleteError, ProjectShareGetError, ProjectSharePostError } from "@/models/errorSchema";
import { useConfirm } from "primevue/useconfirm";
import { useRouter } from "vue-router";

const editorStore = useEditorStore();
const toast = useToast();
const confirm = useConfirm();
const router = useRouter();

const newCollaboratorName = ref('');

const collaborators = ref<ProjectCollaboratorData[]>([]);

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
    const collabRequest: ProjectSharePostRequest = {
        project_id: editorStore.project_id,
        login: newCollaboratorName.value,
    }
    await axiosI.post('/project/share', collabRequest).then(async () => { await updateCollaborators() }).catch((e) => {
        toast.add({ severity: 'error', summary: 'Error', detail: (e as ProjectSharePostError).detail, life: 3000 });
    });
}

const updateCollaborators = async () => {
    await axiosI.get<ProjectShareGetResponse>(`/project/share/${editorStore.project_id}`).then((response) => {
        collaborators.value = response.data;
    }).catch((e) => {
        toast.add({ severity: 'error', summary: 'Error', detail: (e as ProjectShareGetError).detail, life: 3000 });
    })
}

onMounted(async () => {
    await updateCollaborators();
})

const deleteCollaborator = async (login: string) => {
    // TODO: delete collaborator
}

const deleteProject = async () => {
    confirm.require({
        header: 'Вы уверены?',
        message: 'Вы действительно хотите удалить проект?',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: 'Отмена',
            severity: 'secondary',
            text: true
        },
        acceptProps: {
            label: 'Удалить',
            severity: 'danger',
            text: true
        },
        accept: async () => {
            await axiosI.delete(`/project/${editorStore.project_id}`).then(() => {
                router.push('/');
                toast.add({ severity: 'success', summary: 'Success', detail: 'Проект успешно удален', life: 3000 });
            }).catch((e) => {
                toast.add({ severity: 'error', summary: 'Error', detail: (e as ProjectDeleteError).detail, life: 3000 });
            })
        },
    })
}
</script>
