export interface FileInfoResponse {
    id: string;
    name: string;
    download_url?: string;
}

export interface TimecodeFile {
    start: string;
    end: string;
    data: string;
}