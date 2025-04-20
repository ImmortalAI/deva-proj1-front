import type {
  TaskCreateRequest,
  TaskInfoRequest,
  TaskTypes,
} from "@/models/taskScheme";
import { reactive, ref, watch } from "vue";
import { useSSE } from "./useSSE";
import type { FileInfoResponse } from "@/models/fileScheme";
import axios from "axios";

export type TaskStatus = "not_started" | "in_progress" | "done";

export function useTask() {
  const { sseData, sseConnect, sseDisconnect } = useSSE();

  const taskId = ref("");
  const taskState = ref<TaskStatus>("not_started");
  const taskProgressPercentage = ref("");
  const taskResult = reactive<FileInfoResponse[]>([]);

  const createTask = async (fileId: string, ttype: TaskTypes) => {
    if (taskState.value !== "not_started")
      throw new Error("Task already in progress");

    const request: TaskCreateRequest = {
      file_id: fileId,
      task_type: ttype,
    };
    try {
      const response = await axios.post("/api/task/create", request);
      if (response.status === 200) {
        taskId.value = response.data as string;
        sseConnect(`/api/sse/${taskId.value}`);
        taskState.value = "in_progress";
      }
    } catch (e) {
      console.log(e); //FIXME
    }
  };

  watch(sseData, async (newValue) => {
    if (newValue?.data.done) {
      const request_body: TaskInfoRequest = {
        task_id: taskId.value,
      };

      try {
        const response = await axios.post(
          `/api/task/get/${taskId.value}`,
          request_body
        );
        if (response.status === 200) {
          (response.data as FileInfoResponse[]).forEach((file) => {
            taskResult.push(file);
          });
          taskState.value = "done";
          sseDisconnect();
        }
      } catch (e) {
        console.log(e); //FIXME
      }
    } else {
      taskProgressPercentage.value = (
        parseFloat(newValue?.data.status ?? "0") * 100
      ).toFixed(0);
    }
  });

  return {
    taskId,
    taskState,
    taskProgressPercentage,
    taskResult,
    createTask,
  };
}
