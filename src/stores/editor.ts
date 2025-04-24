import { useSSE } from "@/composables/useSSE";
import type { FileInfoResponse } from "@/models/fileSchema";
import type { TaskStatus } from "@/models/taskSchema";
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
  const isTranscriptionFileUploaded = computed(
    () => transcriptionFileId.value !== ""
  );

  const taskId = ref("");
  const taskState = ref<TaskStatus>("not_started");
  const taskProgressPercentage = ref("");
  const taskResult = reactive<FileInfoResponse[]>([]);

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
      sse.sseDisconnect();
    }
    taskId.value = "";
    taskState.value = "not_started";
    taskProgressPercentage.value = "";
    taskResult.length = 0;
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
    isTranscriptionFileUploaded,
    taskId,
    taskState,
    taskProgressPercentage,
    taskResult,
    reset,
  };
});
