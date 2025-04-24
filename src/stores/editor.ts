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
      if (data.transcription_id != null && (transcriptionFile.value == null || data.transcription_id != transcriptionFile.value?.id)) {
        const transcription_data = files_data.find((file) => file.id === data.transcription_id) as FileData;
        console.log(transcription_data);
        if (transcription_data)transcriptionFile.value = transcription_data;
      }
      if (data.origin_file_id  != null && (mediaFile.value == null || data.origin_file_id != mediaFile.value?.id)) {
        const media_data = files_data.find((file) => file.id === data.origin_file_id) as FileData;
        console.log(media_data);
        if (media_data)mediaFile.value = media_data;
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
    taskId,
    taskState,
    taskType,
    taskData,
    reset,
    load_project_data
  };
});
