<script setup lang="ts">
import { ref, onBeforeUnmount, onBeforeMount, computed } from "vue";
import FileUpload, { type FileUploadUploaderEvent } from "primevue/fileupload";
import ProgressBar from "primevue/progressbar";
import { useRoute } from "vue-router";
import type { FileDownloadDataResponse, FileInfoResponse } from "@/models/fileScheme";
import TranscriptionList from "@/components/TranscriptionList.vue";
import { useEditorStore } from "@/stores/editor";
import axios, { type AxiosProgressEvent } from "axios";
import { fetchProjectFiles } from "@/utils/projectCRUD";

const route = useRoute();
const editorStore = useEditorStore();

const videoElement = ref<HTMLVideoElement | null>(null);

const isUploaded = ref(false);
const uploadProgress = ref(0);
const transcriptionFound = ref(false);

const uploadFile = async (event: FileUploadUploaderEvent) => {
  const file = Array.isArray(event.files) ? event.files[0] : event.files;
  const formData = new FormData();
  const projectId = route.params.id;

  if (!file) return;

  formData.append("file", file);
  try {
    const response = await axios.post<FileInfoResponse>("/api/file/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        project_id: projectId,
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.lengthComputable && progressEvent.total) {
          const percent = Math.round(progressEvent.loaded * 100 / progressEvent.total);
          uploadProgress.value = percent;
        }
        else {
          uploadProgress.value = 1;
        }
      }
    });
    editorStore.fileId = response.data.id;
    editorStore.fileName = response.data.name;
    isUploaded.value = true;
    editorStore.fileDownloadUrl = `/api/file/video/${editorStore.fileId}`
  } catch (e) {
    console.log(e); //FIXME
  }
};

function setVideoTime(seconds: number) {
  if (videoElement.value === null) {
    console.warn('Видео элемент не найден.');
    return
  }

  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    console.warn('Некорректное значение времени:', seconds);
    return;
  }

  if (isNaN(videoElement.value.duration)) {
    videoElement.value.addEventListener('loadedmetadata', () => {
      if(videoElement.value){
        if (seconds > videoElement.value.duration) {
        console.warn(`Указанное время превышает длительность видео (${videoElement.value.duration} секунд).`);
        return;
      }
      videoElement.value.currentTime = seconds;
    }
    }, { once: true })
  } else {
    if (seconds > videoElement.value.duration) {
      console.warn(`Указанное время превышает длительность видео (${videoElement.value.duration} секунд).`)
      return
    }
    videoElement.value.currentTime = seconds
  }
}
/* //////////////////////
async function downloadFromUrl(url: string, filename: string): Promise<void> {
  try {
    // Fetch the file
    const response = await fetch(url);
    
    // Check if request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Get the blob data
    const blob = await response.blob();
    
    // Create download link
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = filename;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

// Usage
downloadFromUrl('https://example.com/video.mp4', 'my-video.mp4')
  .then(() => console.log('Download complete'))
  .catch(console.error);
////////////////////// */

/*interface CommentItem {
  timestamp: string;
  content: string;
}

const commentItems = ref<CommentItem[]>([
  { timestamp: "00:10", content: "Event 1" },
  { timestamp: "00:30", content: "Event 2" },
  { timestamp: "01:15", content: "Event 3" },
  { timestamp: "02:00", content: "Event 4" },
  { timestamp: "03:45", content: "Event 5" },
  { timestamp: "05:20", content: "Event 6" },
  { timestamp: "07:30", content: "Event 7" },
]);
const inEditIndex = ref(-1);
const inEditContent = ref("");

function setEdit(index: number) {
  inEditIndex.value = index;
  inEditContent.value = commentItems.value[index].content;
}

function saveTranscription() { }

const videoDuration = ref(0);
const videoElement = ref<HTMLVideoElement | null>(null);
const videoShown = ref(false);

function onFileSelect(event: any) {
  console.log("video selected");
  const file = event.files[0];
  const fileUrl = URL.createObjectURL(file);
  videoShown.value = true; //fixme
  if (videoElement.value) {
    videoElement.value.src = fileUrl;
    videoElement.value.onloadedmetadata = () => {
      videoDuration.value = videoElement.value!.duration;
    };
    videoElement.value.load();
    videoElement.value.play();
  }
}

function onSliderChange(newValue: number) {
  if (videoElement.value) {
    videoElement.value.currentTime = newValue;
  }
}

onMounted(() => {
  if (videoElement.value) {
    timelineValue.value = timeToValue(commentItems.value[0].timestamp);
    videoElement.value.addEventListener("timeupdate", () => {
      timelineValue.value = videoElement.value!.currentTime;
    });
  }
});

const timelineValue = ref(0);
const activeIndex = ref(0);
const scrollContainer = ref<HTMLElement | null>(null);

const timeToValue = (time: string) => {
  const [minutes, seconds] = time.split(":").map(Number);
  return minutes * 60 + seconds;
};

const maxTimeValue = timeToValue(
  commentItems.value[commentItems.value.length - 1].timestamp
);

watch(timelineValue, (newValue) => {
  for (let i = 0; i < commentItems.value.length; i++) {
    const itemValue = timeToValue(commentItems.value[i].timestamp);
    if (itemValue >= newValue) {
      activeIndex.value = i;
      scrollToActiveItem();
      break;
    }
  }
});

const setActive = (index: number) => {
  activeIndex.value = index;
  timelineValue.value = timeToValue(commentItems.value[index].timestamp);
};

const scrollToActiveItem = () => {
  if (scrollContainer.value) {
    const container = scrollContainer.value;
    const activeElement = container.children[activeIndex.value] as HTMLElement;
    container.scrollTo({
      top: activeElement.offsetTop - container.offsetTop - 20,
      behavior: "smooth",
    });
  }
}; */

const getAnyDescription = computed(() => {
  if (editorStore.projectDescription === "") {
    return "Описание отсутствует";
  } else {
    return editorStore.projectDescription;
  }
})

const changeProjectName = () => {
  
}

onBeforeMount(async () => {
  try {
    const response = await fetchProjectFiles(route.params.id as string);
    if (response && response.length > 0) {
      const mediaFile = response.find((file) => file.file_type.startsWith("video")) as FileDownloadDataResponse;
      editorStore.fileId = mediaFile.id;
      editorStore.fileName = mediaFile.name;
      isUploaded.value = true;
      editorStore.fileDownloadUrl = `/api/file/video/${editorStore.fileId}`

      const tsFile = response.find((file) => file.name === "transcript.json");
      if (tsFile) {
        const completeTask: FileInfoResponse = {
          id: tsFile.id,
          name: tsFile.name,
        }
        editorStore.taskResult.push(completeTask);
        transcriptionFound.value = true;
      }
    }
  } catch (e) {
    console.log(e); //FIXME
  }
})

onBeforeUnmount(() => {
  editorStore.reset();
})
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <div class="flex-none">
      <p class="p-2 text-2xl" @click="">{{ editorStore.projectName }}</p>
      <p class="p-2 text-sm">{{ getAnyDescription }}</p>
    </div>
    <div class="w-full flex-1 flex gap-4 p-4 max-h-[80%]">
      <div class="relative basis-3/5 flex justify-center items-start">
        <div v-if="!isUploaded && uploadProgress === 0" class="p-6 text-center">
          <FileUpload mode="basic" name="video" :auto="true" :customUpload="true" @uploader="uploadFile" accept="video/*"
            chooseLabel="" class="w-full">
            <template #content>
              <div class="flex flex-col items-center gap-2 p-4">
                <i class="pi pi-cloud-upload text-4xl text-blue-500" />
                <span class="text-gray-600">Choose a file or drop it here</span>
              </div>
            </template>
          </FileUpload>
          <ProgressBar v-if="uploadProgress > 0" :value="uploadProgress"
            class="w-64 absolute bottom-4 left-1/2 transform -translate-x-1/2" />
        </div>
        <video ref="videoElement" v-else :src="editorStore.fileDownloadUrl" controls class="w-full object-contain bg-black aspect-video" />
      </div>
    
      <TranscriptionList class="p-6 basis-2/5 h-full overflow-y-scroll flex-grow" :fileId="editorStore.fileId"
        :transcription-found="transcriptionFound" @set-video-timing="setVideoTime"></TranscriptionList>
    </div>
  </div>
</template>
