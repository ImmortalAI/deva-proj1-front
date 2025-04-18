import type {
  TaskCreateRequest,
  TaskInfoRequest,
  TaskTypes,
} from "@/models/taskScheme";
import { ref, watch } from "vue";
import { useSSE } from "./useSSE";
import type { FileInfoResponse } from "@/models/fileScheme";

export type TaskStatus = "not_started" | "in_progress" | "done";

export function useTask() {
  const { sseData, sseConnect, sseDisconnect } = useSSE();

  const taskId = ref("");
  const taskState = ref<TaskStatus>("not_started");
  const taskProgressPercentage = ref("");
  const taskResult = ref<FileInfoResponse | null>(null);

  type Callback = () => void
    const taskSubscribers = ref<Callback[]>([]);

  const taskSubscribe = (callback: Callback) => {
    taskSubscribers.value.push(callback);
  };

  const taskEmit = () => {
    taskSubscribers.value.forEach((callback) => callback());
    taskSubscribers.value = [];
  };

  const createTask = async (fileId: string, ttype: TaskTypes) => {
    if (taskState.value !== "not_started")
      throw new Error("Task already in progress");

    const request: TaskCreateRequest = {
      file_id: fileId,
      task_type: ttype,
    };
    const response = await fetch("/api/task/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    if (response.ok) {
      taskId.value = (await response.json()) as string;
      sseConnect(`/api/sse/${taskId.value}`);
      taskState.value = "in_progress";
    }
  };

  watch(sseData, async (newValue) => {
    if (newValue?.data.done) {
      const request_body: TaskInfoRequest = {
        task_id: taskId.value,
      };

      const response = await fetch(`/api/task/get/${taskId.value}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request_body),
      });

      if (response.ok) {
        taskResult.value = (await response.json()) as FileInfoResponse;
        taskState.value = "done";
        taskEmit();
        sseDisconnect();
      } else {
        throw Error(response.statusText);
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
    taskSubscribe,
  }
}
