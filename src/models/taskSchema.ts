export type TaskTypes =
  | "transcribe"
  | "summary"
  | "frames_extract"
  | "summary_edit";
export type TaskStatus = "not_started" | "in_progress" | "done";
export interface TaskCreateRequest {
  task_type: TaskTypes;
  prompt: string;
}

export interface TaskCreateResponse {
  id: string;
  task_type: TaskTypes;
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

export interface WS_Data {
  message_type: string;
  data: any;
}

export interface WSTaskStatus {
  id: string;
  task_type: TaskTypes;
  done: boolean;
  status: number;
}
