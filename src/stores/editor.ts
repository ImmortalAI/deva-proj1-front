import { useSSE } from "@/composables/useSSE";
import type { FileInfoResponse } from "@/models/fileScheme";
import type { TaskStatus } from "@/models/taskScheme";
import { defineStore } from "pinia";
import { reactive, ref } from "vue";

export const useEditorStore = defineStore("editor", () => {
  const projectName = ref("");
  const projectDescription = ref("");

  const fileId = ref("");
  const fileName = ref("");
  const fileDownloadUrl = ref("");

  const taskId = ref("");
  const taskState = ref<TaskStatus>("not_started");
  const taskProgressPercentage = ref("");
  const taskResult = reactive<FileInfoResponse[]>([]);

  const sse = useSSE();
  function reset() {
    projectName.value = "";
    projectDescription.value = "";

    fileId.value = "";
    fileName.value = "";
    fileDownloadUrl.value = "";

    if (taskState.value === "in_progress") {
      sse.sseDisconnect();
    }
    taskId.value = "";
    taskState.value = "not_started";
    taskProgressPercentage.value = "";
    taskResult.length = 0;
  }

  return {
    projectName,
    projectDescription,
    fileId,
    fileName,
    fileDownloadUrl,
    taskId,
    taskState,
    taskProgressPercentage,
    taskResult,
    reset,
  };
});
