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
        </TabList>
        <TabPanels class="max-h-full h-11/12">
            <TabPanel value="0" class="max-h-full h-full">
                <div class="flex box-border max-h-full h-full">
                    <div class="p-2 max-w-3/5 max-h-full">
                        <FileUpload v-if="!editor.isMediaFileUploaded" accept="video/*,audio/*" auto customUpload
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
                            <Timeline :video_sources="video_sources" />
                        </div>
                    </div>
                    <TranscriptionList class="p-6 grow-1 h-full overflow-y-scrollx" :fileId="editor.mediaFileId"
                        :transcription-found="transcriptionFound" @set-video-timing="setVideoTime"></TranscriptionList>
                </div>
            </TabPanel>
            <TabPanel value="1" class="max-h-full">
                <MdEditor v-model="editorText" previewOnly :theme="theming.isDark ? 'dark' : 'light'" language="ru" />
            </TabPanel>
            <TabPanel value="2" class="max-h-full">
                <p>Nothing</p>
            </TabPanel>
        </TabPanels>
    </Tabs>
</template>

<script setup lang="ts">
// #region PrimeVue Imports
import Tabs from 'primevue/tabs';
import Tab from 'primevue/tab';
import TabPanel from 'primevue/tabpanel';
import TabPanels from 'primevue/tabpanels';
import TabList from 'primevue/tablist';
import FileUpload from 'primevue/fileupload';
import ProgressBar from 'primevue/progressbar';
import Button from 'primevue/button';
import type { FileUploadUploaderEvent } from 'primevue';
// #endregion
// #region Libs Imports
import { config, MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import RU from '@vavt/cm-extension/dist/locale/ru'
import { computed, onBeforeMount, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios, { type AxiosProgressEvent } from 'axios';
// #endregion
// #region Local Imports
import TranscriptionList from '@/components/TranscriptionList.vue';
import Timeline from '@/components/Timeline.vue';
import { useTheme } from '@/composables/useTheme';
import type { FileData, FileDownloadDataResponse, FileInfoResponse, FileUploadResponse } from '@/models/fileSchema';
import { useEditorStore } from '@/stores/editor';
import { fetchProjectData, fetchProjectFiles } from '@/utils/projectCRUD';
import { VideoPlayer } from '@videojs-player/vue';

// #endregion

const route = useRoute();
const router = useRouter();
const editor = useEditorStore();
const theming = useTheme();

const editorText = ref('');

config({
    editorConfig: {
        languageUserDefined: {
            'ru': RU
        }
    }
});

const transcriptionFound = ref(false);

onBeforeMount(async () => {
    editor.projectId = route.params.id as string;
    try {
        const projectData = await fetchProjectData(editor.projectId);
        if (projectData) {
            editor.projectName = projectData.name;
            editor.projectDescription = projectData.description;
            editor.projectCreatedDate = projectData.created_date;
            editor.projectLastModifiedDate = projectData.last_modified_date;
            editor.projectOriginFileId = projectData.origin_file_id;
            editor.projectTranscriptionFileId = projectData.transcription_file_id;
            editor.projectSummaryFileId = projectData.summary_file_id;
            editor.projectFramesExtractDone = projectData.frames_extract_done;
        }
    } catch {
        router.push('/');
    }
    try {
        const response = await fetchProjectFiles(route.params.id as string);
        if (response && response.length > 0) {
            const mediaFile = response.find((file) => file.id === editor.projectOriginFileId) as FileData;
            editor.mediaFileId = mediaFile.id;
            editor.mediaFileName = mediaFile.file_name;
            editor.mediaFileMIMEType = mediaFile.file_type;
            editor.mediaFileCreatedDate = mediaFile.created_date;
            editor.mediaFileLastModifiedDate = mediaFile.last_modified_date;

            const transcriptionFile = response.find((file) => file.id === editor.projectTranscriptionFileId);
            if (transcriptionFile) {
                editor.transcriptionFileId = transcriptionFile.id;
                editor.transcriptionFileName = transcriptionFile.file_name;
                editor.transcriptionFileMIMEType = transcriptionFile.file_type;
                editor.transcriptionFileCreatedDate = transcriptionFile.created_date;
                editor.transcriptionFileLastModifiedDate = transcriptionFile.last_modified_date;
            }
            // if (transcriptionFile) {
            //     const completeTask: FileInfoResponse = {
            //         id: tsFile.id,
            //         name: tsFile.name,
            //     }
            //     editor.taskResult.push(completeTask);
            //     transcriptionFound.value = true;
            // } // FIXME fix loading transcription list
        }
    } catch (e) {
        console.log(e); //FIXME
    }
})

onMounted(() => {
    editor.projectId = route.params.id as string;
})

onUnmounted(() => {
    editor.reset();
})

const uploadFileProgress = ref(0);

const video_sources = computed(() => {
    return [
        {
            src: `/api/file/video/${editor.mediaFileId}`,
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
        const response = await axios.post<FileUploadResponse>("/api/file/upload", formData, {
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
        editor.mediaFileId = response.data.id;
        editor.mediaFileName = response.data.file_name;
        editor.mediaFileMIMEType = response.data.file_type;
        editor.mediaFileCreatedDate = response.data.created_date;
        editor.mediaFileLastModifiedDate = response.data.last_modified_date;
    } catch (e) {
        console.log(e); //FIXME
    }
}

const videoElement = ref<HTMLVideoElement | null>(null);

function setVideoTime(seconds: number) {
    if (videoElement.value === null) {
        console.warn('Видео элемент не найден.');
        return
    }

    if (isNaN(videoElement.value.duration)) {
        videoElement.value.addEventListener('loadedmetadata', () => {
            if (videoElement.value) {
                videoElement.value.currentTime = seconds;
            }
        }, { once: true });
    } else {
        videoElement.value.currentTime = seconds
    }
}
</script>