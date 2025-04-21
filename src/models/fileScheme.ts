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