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
  ActiveTasksResponse,
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

  const bigTaskId = ref("");
  const subtaskCount = ref(0);

  const transcribeTaskData = ref<WSTaskStatus | null>(null);
  const summaryTaskData = ref<WSTaskStatus | null>(null);
  const framesExtractTaskData = ref<WSTaskStatus | null>(null);
  const summaryEditTaskData = ref<WSTaskStatus | null>(null);

  const transcribeInProgress = computed(() => {
    return (
      transcribeTaskData.value != null && transcribeTaskData.value.status !== 1
    );
  });
  const summaryInProgress = computed(() => {
    return (
      (summaryTaskData.value != null && summaryTaskData.value.status !== 1) ||
      (summaryEditTaskData.value != null &&
        summaryEditTaskData.value.status !== 1)
    );
  });
  const framesExtractInProgress = computed(() => {
    return (
      framesExtractTaskData.value != null &&
      framesExtractTaskData.value.status !== 1
    );
  });

  const createTask = async (
    taskCreateRequest: TaskCreateRequest
  ): Promise<boolean> => {
    if (bigTaskId.value !== "") {
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Задача уже в работе!",
        life: 3000,
      });
      return false;
    }
    try {
      const response = await axiosI.post<TaskCreateResponse>(
        `/task/${project_id.value}`,
        taskCreateRequest
      );
      if (response.data.subtask_count > 0) {
        bigTaskId.value = response.data.id;
        subtaskCount.value = response.data.subtask_count;
      } else {
        switch (taskCreateRequest.task_type) {
          case "transcribe":
            transcribeTaskData.value = {
              id: response.data.id,
              task_type: response.data.task_type,
              done: false,
              status: 0,
            };
            break;
          case "frames_extract":
            framesExtractTaskData.value = {
              id: response.data.id,
              task_type: response.data.task_type,
              done: false,
              status: 0,
            };
            break;
          case "summary":
            summaryTaskData.value = {
              id: response.data.id,
              task_type: response.data.task_type,
              done: false,
              status: 0,
            };
            break;
          case "summary_edit":
            summaryEditTaskData.value = {
              id: response.data.id,
              task_type: response.data.task_type,
              done: false,
              status: 0,
            };
            break;
        }
      }

      return true;
    } catch (e) {
      showAxiosErrorToast<ErrorResponse>(e);
      return false;
    }
  };

  const newWSMessage = ref<string>("");
  watch(newWSMessage, async (newValue) => {
    if (newValue === "") return;
    const parsedValue: WS_Data = JSON.parse(newValue);
    // Skip message about connection status
    if (parsedValue.message_type === "connection") return;
    // Process message about task status and its completion
    if (parsedValue.message_type === "task_status") {
      const taskDataWS = parsedValue.data as WSTaskStatus;
      // SMALL TASKS
      if (transcribeTaskData.value?.id === taskDataWS.id)
        transcribeTaskData.value = taskDataWS;
      if (summaryTaskData.value?.id === taskDataWS.id)
        summaryTaskData.value = taskDataWS;
      if (framesExtractTaskData.value?.id === taskDataWS.id)
        framesExtractTaskData.value = taskDataWS;
      if (summaryEditTaskData.value?.id === taskDataWS.id)
        summaryEditTaskData.value = taskDataWS;
    } else if (parsedValue.message_type === "task_done") {
      const taskDataWS = parsedValue.data as WSTaskStatus;
      // BIG TASK
      if (taskDataWS.id === bigTaskId.value && taskDataWS.done) return;
      // SMALL TASKS
      if (transcribeTaskData.value?.id === taskDataWS.id)
        transcribeTaskData.value = taskDataWS;
      if (summaryTaskData.value?.id === taskDataWS.id)
        summaryTaskData.value = taskDataWS;
      if (framesExtractTaskData.value?.id === taskDataWS.id)
        framesExtractTaskData.value = taskDataWS;
      if (summaryEditTaskData.value?.id === taskDataWS.id)
        summaryEditTaskData.value = taskDataWS;
      await loadProjectData();
    }
  });

  const transcribeTaskProgress = computed(() => {
    return (transcribeTaskData.value?.status ?? 0) * 100;
  });

  const tasks = {
    transcribe: ref<TaskData | null>(null),
    summary: ref<TaskData | null>(null),
    frames_extract: ref<TaskData | null>(null),
    summary_edit: ref<TaskData | null>(null),
  };

  const notes = ref<Note[]>([]);

  const summaryFileContent = ref<string>("");

  async function fetchActiveTasks() {
    try {
      const tasksResponse = await axiosI.get<ActiveTasksResponse>(
        `/project/get_active_tasks/${project_id.value}`
      );
      tasksResponse.data.forEach((task) => {
        if (task.subtask_count > 0) bigTaskId.value = task.id;
        else {
          switch (task.task_type) {
            case "transcribe":
              transcribeTaskData.value = {
                id: task.id,
                task_type: task.task_type,
                done: false,
                status: 0,
              };
              break;
            case "summary":
              summaryTaskData.value = {
                id: task.id,
                task_type: task.task_type,
                done: false,
                status: 0,
              };
              break;
            case "frames_extract":
              framesExtractTaskData.value = {
                id: task.id,
                task_type: task.task_type,
                done: false,
                status: 0,
              };
              break;
            case "summary_edit":
              summaryEditTaskData.value = {
                id: task.id,
                task_type: task.task_type,
                done: false,
                status: 0,
              };
              break;
          }
        }
      });
    } catch (e) {
      showAxiosErrorToast<ErrorResponse>(e);
    }
  }

  async function loadProjectData() {
    const data = await fetchProjectData(project_id.value);
    if (data == undefined) return;
    const files_data = await fetchProjectFiles(project_id.value);
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

  async function loadNotes(file_id: string) {
    const new_notes = await getNotes(file_id);
    if (new_notes) notes.value = new_notes;
  }

  function reset() {
    project_id.value = "";
    project_data.value = { ...EmptyProjectData };

    mediaFile.value = null;
    transcriptionFile.value = null;
    summaryFile.value = null;
    videoFrames.length = 0;

    bigTaskId.value = "";
    subtaskCount.value = 0;
    transcribeTaskData.value = null;
    summaryTaskData.value = null;
    framesExtractTaskData.value = null;
    summaryEditTaskData.value = null;

    notes.value = [];
    summaryFileContent.value = "";
    newWSMessage.value = "";
  }

  return {
    project_id,
    project_data,
    mediaFile,
    transcriptionFile,
    summaryFile,
    videoFrames,
    bigTaskId,
    transcribeTaskData,
    summaryTaskData,
    framesExtractTaskData,
    summaryEditTaskData,
    transcribeInProgress,
    summaryInProgress,
    framesExtractInProgress,
    transcribeTaskProgress,
    newWSMessage,
    notes,
    summaryFileContent,
    tasks,
    createTask,
    reset,
    loadProjectData,
    fetchActiveTasks,
    loadNotes,
  };
});
