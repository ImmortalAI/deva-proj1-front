import { useSSE } from "@/composables/useSSE";
import type { TaskSSEResponse, TaskTypes, TaskStatus } from "@/models/taskSchema";
import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";

export const useEditorStore = defineStore("editor", () => {
  const projectId = ref("");
  const projectName = ref("");
  const projectDescription = ref("");
  const projectCreatedDate = ref("");
  const projectLastModifiedDate = ref("");
  const projectOriginFileId = ref<string | null>(null);
  const projectTranscriptionFileId = ref<string | null>(null);
  const projectSummaryFileId = ref<string | null>(null);
  const projectFramesExtractDone = ref(false);

  const mediaFileId = ref("");
  const mediaFileName = ref("");
  const mediaFileMIMEType = ref("");
  const mediaFileCreatedDate = ref("");
  const mediaFileLastModifiedDate = ref("");
  const mediaFileDlUrl = computed(
    () => `/api/file/video/${mediaFileId.value}`
  );
  const isMediaFileUploaded = computed(() => mediaFileId.value !== "");

  const transcriptionFileId = ref("");
  const transcriptionFileName = ref("");
  const transcriptionFileMIMEType = ref("");
  const transcriptionFileCreatedDate = ref("");
  const transcriptionFileLastModifiedDate = ref("");
  const isTranscriptionFileExist = computed(
    () => transcriptionFileId.value !== ""
  );

  const taskId = ref("");
  const taskState = ref<TaskStatus>("not_started");
  const taskType = ref<TaskTypes | null>(null);
  const taskData = reactive<TaskSSEResponse[]>([]);

  const sse = useSSE();
  function reset() {
    projectId.value = "";
    projectName.value = "";
    projectDescription.value = "";
    projectCreatedDate.value = "";
    projectLastModifiedDate.value = "";
    projectOriginFileId.value = null;
    projectTranscriptionFileId.value = null;
    projectSummaryFileId.value = null;
    projectFramesExtractDone.value = false;

    mediaFileId.value = "";
    mediaFileName.value = "";
    mediaFileMIMEType.value = "";
    mediaFileCreatedDate.value = "";
    mediaFileLastModifiedDate.value = "";

    transcriptionFileId.value = "";
    transcriptionFileName.value = "";
    transcriptionFileMIMEType.value = "";
    transcriptionFileCreatedDate.value = "";
    transcriptionFileLastModifiedDate.value = "";

    if (taskState.value === "in_progress") {
      sse.disconnect();
    }
    taskId.value = "";
    taskState.value = "not_started";
    taskType.value = null;
    taskData.length = 0;
  }

  return {
    projectId,
    projectName,
    projectDescription,
    projectCreatedDate,
    projectLastModifiedDate,
    projectOriginFileId,
    projectTranscriptionFileId,
    projectSummaryFileId,
    projectFramesExtractDone,
    mediaFileId,
    mediaFileName,
    mediaFileMIMEType,
    mediaFileCreatedDate,
    mediaFileLastModifiedDate,
    mediaFileDlUrl,
    isMediaFileUploaded,
    transcriptionFileId,
    transcriptionFileName,
    transcriptionFileMIMEType,
    transcriptionFileCreatedDate,
    transcriptionFileLastModifiedDate,
    isTranscriptionFileExist,
    taskId,
    taskState,
    taskType,
    taskData,
    reset,
  };
});
