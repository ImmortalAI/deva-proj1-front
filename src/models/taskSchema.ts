export type TaskTypes = "transcribe" | "summary" | "frames_extract" | "summary_edit";
export type TaskStatus = "not_started" | "in_progress" | "done";
export interface TaskCreateRequest {
  task_type: TaskTypes;
  file_id: string;
}

export interface TaskCreateResponse {
  task_id: string;
}

export interface TaskInfoRequest {
  task_id: string;
}

export interface TaskSSEResponse {
  id: string;
  done: boolean;
  status: string | null;
}
