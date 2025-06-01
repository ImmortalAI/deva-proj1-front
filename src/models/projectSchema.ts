import type { FileData } from "./fileSchema";

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
  transcription_id: string | null;
  summary_id: string | null;
  frames_extract_done: boolean;
}

export const EmptyProjectData: ProjectData = {
  id: "",
  name: "",
  description: "",
  created_date: "",
  last_modified_date: "",
  origin_file_id: null,
  transcription_id: null,
  summary_id: null,
  frames_extract_done: false,
};

export interface ProjectCreateRequest {
  name: string;
  description: string;
}

export type ProjectCreateResponse = ProjectData;

export type ProjectDeleteResponse = ProjectSingleMessage;

export type ProjectPatchResponse = ProjectSingleMessage;

export type ProjectGetResponse = ProjectData;

export type ProjectGetAllFilesResponse = FileData[];

export type ProjectListResponse = ProjectData[];

export interface ProjectPatchRequest {
  name?: string;
  description?: string;
}

export interface ProjectGetActiveTasksResponse {
  // TODO
}

export interface ProjectSharePostRequest {
  login: string;
  project_id: string;
}

export interface ProjectShareDeleteRequest {
  login: string;
  project_id: string;
}

export interface ProjectCollaboratorData {
  id: string;
  login: string;
}

export type ProjectShareGetResponse = ProjectCollaboratorData[];