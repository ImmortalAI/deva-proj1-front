export interface ProjectSingleMessage {
  message: string;
}

export interface ProjectData {
    id: string;
    name: string;
    description: string;
    created_date: string;
    last_modified_date: string;
    origin_file_id: string | null;
    transcription_file_id: string | null;
    summary_file_id: string | null;
    frames_extract_done: boolean;
  }

export interface ProjectCreateRequest {
  name: string;
  description: string;
}

export type ProjectCreateResponse = ProjectData;

export type ProjectDeleteResponse = ProjectSingleMessage;

export interface ProjectPatchResponse {
  name: string | null;
  description: string | null;
}

export type ProjectGetResponse = ProjectData;

export interface ProjectGetAllFilesResponse {
  // TODO add response fields
}

export type ProjectListResponse = ProjectData[];

export interface ProjectInfoResponse {
  id: string;
  name: string;
  description: string;
  created_date: string;
  last_modified_date: string;
}

export interface ProjectPatchRequest {
  id: string;
  name?: string;
  description?: string;
}
