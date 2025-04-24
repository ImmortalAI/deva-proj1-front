import type { TaskCreateRequest, TaskCreateResponse } from "@/models/taskSchema";
import { useEditorStore } from "@/stores/editor"
import axios from "axios";
import { useSSE } from "./useSSE";
import { computed, ref, watch } from "vue";
import { fetchProjectData } from "@/utils/projectCRUD";

export function useTask() {
    const editor = useEditorStore();
    const sse = useSSE();

    const subtaskCount = ref(0);

    const createTask = async (taskCreateRequest: TaskCreateRequest): Promise<boolean> => {
        if (editor.taskState === 'in_progress') {
            console.error("Task already in progress");
            return false;
        }
        if (editor.taskState === 'done') {
            editor.taskId = '';
            editor.taskState = 'not_started';
            editor.taskData.length = 0;
            editor.taskType = null;
        }
        try {
            const response = await axios.post<TaskCreateResponse>(
                "/api/task",
                taskCreateRequest
            );
            editor.taskId = response.data.id;
            editor.taskType = taskCreateRequest.task_type;
            editor.taskState = "in_progress";
            subtaskCount.value = response.data.subtask_count;
            sse.connect(`/api/task/sse/${editor.taskId}`);
            return true;
        } catch (e) {
            console.log(e); //FIXME
            return false;
        }
    };

    watch(sse.data, (newValue) => {
        if(newValue === null) return; 
        const subtaskIndex = editor.taskData.findIndex((task) => task.id === newValue.id);
        if (subtaskIndex !== -1) {
            editor.taskData[subtaskIndex] = newValue;
        }
    })

    const totalTaskProgress = computed(() => {
        return editor.taskData.reduce((sum, task) => sum + (task.status ?? 1), 0) / (subtaskCount.value + 1) * 100;
    })

    watch(editor.taskData, async (newValue) => {
        if (newValue.length === (subtaskCount.value + 1) && newValue.every((task) => task.done)) {
            editor.taskState = "done";
            sse.disconnect();
            await editor.load_project_data(editor.project_id);
        }
    })

    return {
        createTask,
        totalTaskProgress,
    }
}