export interface FileData {
    id: string;
    file_name: string;
    file_type: string;
    created_date: string;
    last_modified_date: string;
}

export interface FileUploadQuery {
    project_id: string;
}

export type FileUploadResponse = FileData;

// FIXME fix from this
export interface FileInfoResponse {
    id: string;
    name: string;
}

export interface FileFullInfoResponse extends FileInfoResponse {
    download_url: string;
}

export interface TimecodeFile {
    start: string;
    end: string;
    text: string;
}

export interface FileDownloadDataResponse {
    id: string;
    name: string;
    file_type: string;
    created_date: string;
    last_modified_date: string;
    download_url: string | null;
}
// FIXME fix to this (delete this useless sheesh)