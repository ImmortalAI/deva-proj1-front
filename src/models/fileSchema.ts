export interface FileData {
  id: string;
  file_name: string;
  file_type: string;
  created_date: string;
  last_modified_date: string;
  metadata_is_hide: boolean;
  metadata_text: string;
  metadata_timecode: number;
}

export interface TimecodeFile {
  start: string;
  end: string;
  text: string;
}

export interface FileUploadQuery {
  project_id: string;
}

export type FileUploadResponse = FileData;

export interface FilePatchRequest {
  file_name?: string;
  metadata_is_hide?: boolean;
  metadata_text?: string;
  metadata_timecode?: number;
}