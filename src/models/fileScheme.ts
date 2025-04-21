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
    download_url: string;
}