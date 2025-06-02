import type {
  TaskCreateRequest,
  TaskCreateResponse,
} from "@/models/taskSchema";
import { useEditorStore } from "@/stores/editor";
import axiosI from "@/utils/axiosInstance";
import { useSSE } from "@/composables/useSSE";
import { computed, ref, watch } from "vue";
import type { ErrorResponse } from "@/models/errorSchema";
import { showAxiosErrorToast, showToast } from "@/utils/toastService";

export function useTask() {
  const editor = useEditorStore();
  const sse = useSSE();

  const subtaskCount = ref(0);

  const createTask = async (
    taskCreateRequest: TaskCreateRequest
  ): Promise<boolean> => {
    if (editor.taskState === "in_progress") {
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Задача уже в работе!",
        life: 3000,
      });
      return false;
    }
    if (editor.taskState === "done") {
      editor.taskId = "";
      editor.taskState = "not_started";
      editor.taskData.length = 0;
      editor.taskType = null;
    }
    try {
      const response = await axiosI.post<TaskCreateResponse>(
        `/task/${editor.project_id}`,
        taskCreateRequest,
      );
      editor.taskId = response.data.id;
      editor.taskType = taskCreateRequest.task_type;
      editor.taskState = "in_progress";
      subtaskCount.value = response.data.subtask_count;
      sse.connect(`/task/sse/${editor.taskId}`);
      return true;
    } catch (e) {
      showAxiosErrorToast<ErrorResponse>(e);
      return false;
    }
  };

  watch(sse.data, (newValue) => {
    if (newValue === null) return;
    const subtaskIndex = editor.taskData.findIndex(
      (task) => task.id === newValue.id
    );
    if (subtaskIndex !== -1) {
      editor.taskData[subtaskIndex] = newValue;
    } else {
      editor.taskData.push(newValue);
    }
  });

  const totalTaskProgress = computed(() => {
    return (
      (editor.taskData.reduce((sum, task) => sum + (task.status ?? 1), 0) /
        (subtaskCount.value + 1)) *
      100
    );
  });

  const transcribeTaskProgress = computed(() => {
    const task = editor.taskData.find(
      (task) => task.task_type === "transcribe"
    );
    return (task?.status ?? 0) * 100;
  });

  watch(editor.taskData, async (newValue) => {
    const mainTask = newValue.find((task) => task.id === editor.taskId);
    if (mainTask !== undefined && mainTask.done) {
      editor.taskState = "done";
      sse.disconnect();
      await editor.load_project_data(editor.project_id);
    }
  });

  return {
    createTask,
    totalTaskProgress,
    transcribeTaskProgress,
  };
}
