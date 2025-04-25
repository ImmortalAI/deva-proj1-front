export type TaskTypes =
  | "transcribe"
  | "summary"
  | "frames_extract"
  | "summary_edit";
export type TaskStatus = "not_started" | "in_progress" | "done";
export interface TaskCreateRequest {
  project_id: string;
  task_type: TaskTypes;
  prompt: string;
}

export interface TaskCreateResponse {
  id: string;
  subtask_count: number;
}

export interface TaskSSEResponse {
  id: string;
  task_type: TaskTypes;
  done: boolean;
  status: number | null;
}

export interface ActiveTask {
  id: string;
  task_type: TaskTypes;
}

export interface TaskData {
  id: string;
  task_type: TaskTypes;
  data: TaskSSEResponse | null;
}
