<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import FileUpload, { type FileUploadUploaderEvent } from "primevue/fileupload";
import Button from "primevue/button";
import Slider from "primevue/slider";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import ProgressBar from "primevue/progressbar";
import { useRoute } from "vue-router";
import type { FileInfoResponse } from "@/models/fileScheme";
import type {
  TaskCreateRequest,
  TaskInfoRequest,
  TaskTypes,
} from "@/models/taskScheme";
import { useSSE } from "@/composables/useSSE";
import TranscriptionList from "@/components/TranscriptionList.vue";
import { useEditorStore } from "@/stores/editor";

const route = useRoute();
const editorStore = useEditorStore();

const isUploaded = ref(false);
const uploadProgress = ref(0);
const uploadedVideoUrl = ref<string | null>(null);

const videoId = ref("");
const taskId = ref("");

const { sseData, sseConnect, sseDisconnect } = useSSE();

const uploadFile = async (event: FileUploadUploaderEvent) => {
  const file = Array.isArray(event.files) ? event.files[0] : event.files;
  const formData = new FormData();
  const projectId = route.params.id;

  if (!file) return;

  formData.append("file", file);
  formData.append("project_id", projectId.toString());
  const response = await fetch("/api/file/upload", {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    const data = (await response.json()) as FileInfoResponse;
    videoId.value = data.id;
    isUploaded.value = true;
  }
};

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

interface CommentItem {
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
};
</script>

<template>
  <div class="w-full grid grid-cols-[60%_40%] grid-rows-2 gap-4 p-4">
    <div
      class="relative w-full h-96 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
      <div v-if="!isUploaded" class="text-center">
        <FileUpload mode="basic" name="video" :auto="true" :customUpload="true" @uploader="uploadFile" accept="video/*"
          chooseLabel="" class="w-full">
          <template #content>
            <div class="flex flex-col items-center gap-2 p-4">
              <i class="pi pi-cloud-upload text-4xl text-blue-500" />
              <span class="text-gray-600">Choose a file or drop it here</span>
            </div>
          </template>
        </FileUpload>
        <!-- <ProgressBar 
        v-if="uploadProgress > 0"
        :value="uploadProgress"
        class="w-64 absolute bottom-4 left-1/2 transform -translate-x-1/2"
      /> -->
      </div>

      <!-- <video 
      v-else
      :src="uploadedVideoUrl"
      controls
      class="w-full h-full rounded-lg object-contain bg-black"
    /> -->
    </div>

    <TranscriptionList :fileId="editorStore.fileId" :setActive="setActive"></TranscriptionList>
  </div>
</template>
