import { useSSE } from "@/composables/useSSE";
import type { FileData } from "@/models/fileSchema";
import type { Note } from "@/models/noteSchema";
import { EmptyProjectData, type ProjectData } from "@/models/projectSchema";
import type {
  TaskSSEResponse,
  TaskTypes,
  TaskStatus,
  TaskData,
  TaskCreateRequest,
  TaskCreateResponse,
  WS_Data,
  WSTaskStatus,
} from "@/models/taskSchema";
import {
  fetchProjectData,
  fetchProjectFiles,
  getNotes,
  projectActiveTasks,
} from "@/utils/projectCRUD";
import axiosI from "@/utils/axiosInstance";
import { defineStore } from "pinia";
import { computed, reactive, ref, watch } from "vue";
import { showAxiosErrorToast, showToast } from "@/utils/toastService";
import type { ErrorResponse } from "@/models/errorSchema";

export const useEditorStore = defineStore("editor", () => {
  const project_id = ref<string>("");

  const project_data = ref<ProjectData>({ ...EmptyProjectData });
  const mediaFile = ref<FileData | null>(null);
  const transcriptionFile = ref<FileData | null>(null);
  const summaryFile = ref<FileData | null>(null);
  const videoFrames = reactive<FileData[]>([]);

  const taskId = ref("");
  const taskState = ref<TaskStatus>("not_started");
  const taskType = ref<TaskTypes | null>(null);
  const taskData = ref<WSTaskStatus[]>([]);

  const subtaskCount = ref(0);

  const createTask = async (
    taskCreateRequest: TaskCreateRequest
  ): Promise<boolean> => {
    if (taskState.value === "in_progress") {
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Задача уже в работе!",
        life: 3000,
      });
      return false;
    }
    if (taskState.value === "done") {
      taskId.value = "";
      taskState.value = "not_started";
      taskData.value.length = 0;
      taskType.value = null;
    }
    try {
      const response = await axiosI.post<TaskCreateResponse>(
        `/task/${project_id.value}`,
        taskCreateRequest
      );
      taskId.value = response.data.id;
      taskType.value = response.data.task_type;
      taskState.value = "in_progress";
      subtaskCount.value = response.data.subtask_count;

      return true;
    } catch (e) {
      showAxiosErrorToast<ErrorResponse>(e);
      return false;
    }
  };

  const newWSMessage = ref<string>("");
  watch(newWSMessage, (newValue) => {
    if (newValue === "") return;
    const parsedValue: WS_Data = JSON.parse(newValue);
    // Skip message about connection status
    if (parsedValue.message_type === "connection") return;
    // Process message about task status and its completion
    if (parsedValue.message_type === "task_status" || parsedValue.message_type === "task_done") {
      const taskDataWS = parsedValue.data as WSTaskStatus;
      const subtaskIndex = taskData.value.findIndex(
        (task) => task.id === taskDataWS.id
      );
      if (subtaskIndex !== -1) {
        taskData.value[subtaskIndex] = taskDataWS;
      } else {
        taskData.value.push(taskDataWS);
      }
    }
  });

  const totalTaskProgress = computed(() => {
    return (
      (taskData.value.reduce((sum, task) => sum + (task.status ?? 1), 0) /
        (subtaskCount.value + 1)) *
      100
    );
  });

  const transcribeTaskProgress = computed(() => {
    const task = taskData.value.find((task) => task.task_type === "transcribe");
    return (task?.status ?? 0) * 100;
  });

  watch(taskData, async (newValue) => {
    const mainTask = newValue.find((task) => task.id === taskId.value);
    console.log("TASKA BLYA")
    if (mainTask !== undefined && mainTask.done) {
      console.log("TASKA DONE")
      taskState.value = "done";
      await load_project_data(project_id.value);
    }
  }, {deep: true});

  const tasks = {
    transcribe: ref<TaskData | null>(null),
    summary: ref<TaskData | null>(null),
    frames_extract: ref<TaskData | null>(null),
    summary_edit: ref<TaskData | null>(null),
  };

  const notes = ref<Note[]>([]);

  const summaryFileContent = ref<string>("");

  async function load_project_data(project_id: string) {
    const data = await fetchProjectData(project_id);
    if (data == undefined) return;
    const files_data = await fetchProjectFiles(project_id);
    if (files_data != undefined) {
      if (data.transcription_id != null && transcriptionFile.value == null) {
        const transcription_data = files_data.find(
          (file) => file.id === data.transcription_id
        ) as FileData;
        if (transcription_data) transcriptionFile.value = transcription_data;
      }
      if (data.origin_file_id != null && mediaFile.value == null) {
        const media_data = files_data.find(
          (file) => file.id === data.origin_file_id
        ) as FileData;
        if (media_data) mediaFile.value = media_data;
      }
      if (
        data.summary_id != null &&
        (summaryFile.value == null || data.summary_id != summaryFile.value?.id)
      ) {
        const summary_data = files_data.find(
          (file) => file.id === data.summary_id
        ) as FileData;
        if (summary_data) {
          summaryFile.value = summary_data;
          const response = await axiosI.get<string>(
            `/file/download/${summary_data.id}`
          );
          summaryFileContent.value = response.data;
        }
      }
      if (data.frames_extract_done && videoFrames.length == 0) {
        files_data.forEach((file) => {
          if (file.file_type.startsWith("image")) videoFrames.push(file);
        });
      }
    }
    project_data.value = data;
    await load_tasks();
  }

  async function load_tasks() {
    const fetched_tasks = await projectActiveTasks(project_id.value);
    if (!fetched_tasks) return;
  }

  async function load_notes(file_id: string) {
    const new_notes = await getNotes(file_id);
    if (new_notes) notes.value = new_notes;
  }

  function reset() {
    project_data.value = { ...EmptyProjectData };
    mediaFile.value = null;
    transcriptionFile.value = null;

    summaryFileContent.value = "";

    taskId.value = "";
    taskState.value = "not_started";
    taskType.value = null;
    taskData.value.length = 0;
  }

  return {
    project_id,
    project_data,
    mediaFile,
    transcriptionFile,
    summaryFile,
    videoFrames,
    taskId,
    taskState,
    taskType,
    taskData,
    totalTaskProgress,
    transcribeTaskProgress,
    newWSMessage,
    notes,
    summaryFileContent,
    tasks,
    createTask,
    reset,
    load_project_data,
    load_notes,
  };
});
