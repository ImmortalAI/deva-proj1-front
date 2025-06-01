import { useSSE } from "@/composables/useSSE";
import type { FileData } from "@/models/fileSchema";
import type { Note } from "@/models/noteSchema";
import type { ProjectData } from "@/models/projectSchema";
import type {
  TaskSSEResponse,
  TaskTypes,
  TaskStatus,
  TaskData,
} from "@/models/taskSchema";
import {
  fetchProjectData,
  fetchProjectFiles,
  getNotes,
  projectActiveTasks,
} from "@/utils/projectCRUD";
import axiosI from '@/utils/axiosInstance'
import { defineStore } from "pinia";
import { reactive, ref } from "vue";

export const useEditorStore = defineStore("editor", () => {
  const project_id = ref<string>("");

  const project_data = ref<ProjectData | null>(null);
  const mediaFile = ref<FileData | null>(null);
  const transcriptionFile = ref<FileData | null>(null);
  const summaryFile = ref<FileData | null>(null);
  const videoFrames = reactive<FileData[]>([]);

  const taskId = ref("");
  const taskState = ref<TaskStatus>("not_started");
  const taskType = ref<TaskTypes | null>(null);
  const taskData = reactive<TaskSSEResponse[]>([]);

  const tasks = {
    transcribe: ref<TaskData | null>(null),
    summary: ref<TaskData | null>(null),
    frames_extract: ref<TaskData | null>(null),
    summary_edit: ref<TaskData | null>(null),
  };

  const notes = ref<Note[]>([]);

  const sse = useSSE();

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
    project_data.value = null;
    mediaFile.value = null;
    transcriptionFile.value = null;

    summaryFileContent.value = "";

    if (taskState.value === "in_progress") {
      sse.disconnect();
    }
    taskId.value = "";
    taskState.value = "not_started";
    taskType.value = null;
    taskData.length = 0;
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
    notes,
    summaryFileContent,
    tasks,
    reset,
    load_project_data,
    load_notes,
  };
});
