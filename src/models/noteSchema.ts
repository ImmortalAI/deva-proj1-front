export interface Note {
    id: string
    text: string
    start_time_code: number
    end_time_code: number
}

export interface NoteCreateRequest {
    file_id: string
    text: string
    start_time_code: number
    end_time_code: number
}

export interface NoteUpdateRequest {
    text?: string
    start_time_code?: number
    end_time_code?: number
}