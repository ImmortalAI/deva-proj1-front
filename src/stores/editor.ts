import { useSSE } from "@/composables/useSSE";
import type { FileInfoResponse } from "@/models/fileScheme";
import type { TaskStatus } from "@/models/taskScheme";
import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";

export const useEditorStore = defineStore("editor", () => {
  const projectId = ref("");
  const projectName = ref("");
  const projectDescription = ref("");

  const mediaFileId = ref("");
  const mediaFileName = ref("");
  const mediaFileDlUrl = ref("");
  const isMediaFileUploaded = computed(() => mediaFileId.value !== "");

  const taskId = ref("");
  const taskState = ref<TaskStatus>("not_started");
  const taskProgressPercentage = ref("");
  const taskResult = reactive<FileInfoResponse[]>([]);

  const sse = useSSE();
  function reset() {
    projectId.value = "";
    projectName.value = "";
    projectDescription.value = "";

    mediaFileId.value = "";
    mediaFileName.value = "";
    mediaFileDlUrl.value = "";

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
    mediaFileId,
    mediaFileName,
    mediaFileDlUrl,
    isMediaFileUploaded,
    taskId,
    taskState,
    taskProgressPercentage,
    taskResult,
    reset,
  };
});
