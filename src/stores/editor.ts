import { useSSE } from "@/composables/useSSE";
import type { FileFullInfoResponse } from "@/models/fileScheme";
import type { TaskStatus } from "@/models/taskScheme";
import { defineStore } from "pinia";
import { reactive, ref } from "vue";

export const useEditorStore = defineStore("editor", () => {
  const fileId = ref("");
  const fileName = ref("");
  const fileDownloadUrl = ref("");

  const taskId = ref("");
  const taskState = ref<TaskStatus>("not_started");
  const taskProgressPercentage = ref("");
  const taskResult = reactive<FileFullInfoResponse[]>([]);

  const sse = useSSE();
  function reset() {
    fileId.value = "";
    fileName.value = "";
    fileDownloadUrl.value = "";

    if (taskState.value === "in_progress") {
      sse.sseDisconnect();
    }
    taskState.value = "not_started";
    taskProgressPercentage.value = "";
    taskResult.length = 0;
  }

  return {
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
