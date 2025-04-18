export type TaskTypes = 'transcribe' | 'summary' | 'frames_extract';
export interface TaskCreateRequest {
    task_type: TaskTypes;
    file_id: string;
}

export interface TaskInfoRequest {
    task_id: string;
}

export interface TaskSSEResponse {
    data: {
        id: string;
        done: boolean;
        status: string | null;
    }
}