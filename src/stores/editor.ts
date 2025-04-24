import { useSSE } from "@/composables/useSSE";
import type { FileData } from "@/models/fileSchema";
import type { ProjectData } from "@/models/projectSchema";
import type { TaskSSEResponse, TaskTypes, TaskStatus } from "@/models/taskSchema";
import { fetchProjectData, fetchProjectFiles } from "@/utils/projectCRUD";
import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";

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

  const sse = useSSE();

  async function load_project_data(project_id: string) {
    const data = await fetchProjectData(project_id)
    if (data == undefined) return;
    const files_data = await fetchProjectFiles(project_id);
    if (files_data != undefined) {
      if (data.transcription_id != null && transcriptionFile.value == null) {
        const transcription_data = files_data.find((file) => file.id === data.transcription_id) as FileData;
        if (transcription_data)transcriptionFile.value = transcription_data;
      }
      if (data.origin_file_id  != null && mediaFile.value == null) {
        const media_data = files_data.find((file) => file.id === data.origin_file_id) as FileData;
        if (media_data)mediaFile.value = media_data;
      }
      if(data.summary_file_id != null && summaryFile.value == null){
        const summary_data = files_data.find((file) => file.id === data.summary_file_id) as FileData;
        if (summary_data)summaryFile.value = summary_data;
      }
      if(data.frames_extract_done && videoFrames.length == 0){
        files_data.forEach((file) => {
          if(file.file_type.startsWith("image")) videoFrames.push(file);
        });
      }
    }
    project_data.value = data;
  }

  function reset() {

    project_data.value = null;
    mediaFile.value = null;
    transcriptionFile.value = null;

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
    reset,
    load_project_data
  };
});
