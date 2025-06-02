<template>
    <Tabs value="0" class="max-w-screen w-screen h-full max-h-full flex flex-col">
        <TabList class="h-1/12">
            <Tab value="0">
                <i class="pi pi-wrench mr-2"></i>
                <span>Транскрипция</span>
            </Tab>
            <Tab value="1">
                <i class="pi pi-book mr-2"></i>
                <span>Конспект</span>
            </Tab>
            <Tab value="2">
                <i class="pi pi-images mr-2"></i>
                <span>Кадры</span>
            </Tab>
            <Tab value="3">
                <i class="pi pi-cog mr-2"></i>
                <span>Настройки</span>
            </Tab>
        </TabList>
        <TabPanels class="max-h-full h-11/12" style="background: none;">
            <TabPanel value="0" class="max-h-full h-full">
                <div class="flex box-border max-h-full h-full">
                    <div class="p-2 min-w-3/5 w-3/5 max-w-3/5 max-h-full">
                        <FileUpload v-if="editor.mediaFile == null" accept="video/*,audio/*" auto customUpload
                            @uploader="customMediaUploader($event)" :maxFileSize="10737418240">
                            <template #header="{ chooseCallback }">
                                <Button class="w-full" @click="chooseCallback">Выбрать файл</Button>
                            </template>
                            <template #content>
                                <div class="flex flex-wrap justify-between items-center flex-1 gap-4">
                                    <ProgressBar :value="uploadFileProgress" :showValue="false"
                                        class="md:w-20rem h-1 w-full md:ml-auto">
                                    </ProgressBar>
                                </div>
                            </template>
                            <template #empty>
                                <div class="flex items-center justify-center flex-col">
                                    <i class="pi pi-cloud-upload !border-2 !rounded-full !p-8 !text-4xl" />
                                    <p class="mt-6 mb-0">Перетяни файлы сюда, чтобы загрузить их.</p>
                                </div>
                            </template>
                        </FileUpload>
                        <div v-else class="flex flex-col max-w-full max-h-full w-full h-full">
                            <!-- <audio :src="editor.mediaFileDlUrl"></audio> -->
                            <VideoPlayerWithTimeline :video_sources="video_sources" ref="player" />
                        </div>
                    </div>
                    <TranscriptionList class="p-6 grow-1 h-full overflow-y-scrollx" @setVideoTiming="setTimecode">
                    </TranscriptionList>
                </div>
            </TabPanel>
            <TabPanel value="1" class="max-h-full h-full">
                <SummaryTab></SummaryTab>
            </TabPanel>
            <TabPanel value="2" class="max-h-full h-full">
                <Gallery></Gallery>
            </TabPanel>
            <TabPanel value="3" class="max-h-full h-full">
                <ProjectSettings></ProjectSettings>
            </TabPanel>
        </TabPanels>
    </Tabs>
</template>

<script setup lang="ts">
// #region PrimeVue Imports
import type { FileUploadUploaderEvent } from 'primevue';
// #endregion
// #region Libs Imports

import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { AxiosProgressEvent } from 'axios';
import axiosI from '@/utils/axiosInstance'
// #endregion
// #region Local Imports
import { useTheme } from '@/composables/useTheme';
import type { FileUploadResponse } from '@/models/fileSchema';
import { useEditorStore } from '@/stores/editor';
import type { FileUploadError } from '@/models/errorSchema';
import { showAxiosErrorToast } from '@/utils/toastService';

// #endregion
const player = ref()

function setTimecode(timecode: number) {
    player.value.setVideoTimecode(timecode);
}

const route = useRoute();
const router = useRouter();
const editor = useEditorStore();
const theming = useTheme();



const transcriptionFound = ref(false);

onMounted(async () => {
    editor.project_id = route.params.id as string;

    try {
        await editor.load_project_data(editor.project_id);
    } catch {
        router.push('/');
    }
    if (editor.project_data?.origin_file_id == null) return;
    await editor.load_notes(editor.project_data?.origin_file_id)
})

onUnmounted(() => {
    editor.reset();
})

const uploadFileProgress = ref(0);

const video_sources = computed(() => {
    return [
        {
            src: `/file/video/${editor.project_data?.origin_file_id}`,
            type: 'video/mp4'
        }
    ]
})

async function customMediaUploader(event: FileUploadUploaderEvent) {
    const file = Array.isArray(event.files) ? event.files[0] : event.files;
    const formData = new FormData();
    const projectId = route.params.id;

    if (!file) return;

    formData.append("file", file);
    try {
        const response = await axiosI.post<FileUploadResponse>("/file", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            params: {
                project_id: projectId,
            },
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                if (progressEvent.lengthComputable && progressEvent.total) {
                    const percent = Math.round(progressEvent.loaded * 100 / progressEvent.total);
                    uploadFileProgress.value = percent;
                }
                else {
                    uploadFileProgress.value = 1;
                }
            }
        });
        if (!editor.project_data) {
            editor.load_project_data(editor.project_id);
            return
        }
        editor.project_data.origin_file_id = response.data.id;
        editor.mediaFile = response.data;
    } catch (e) {
        showAxiosErrorToast<FileUploadError>(e);
    }
}
</script>