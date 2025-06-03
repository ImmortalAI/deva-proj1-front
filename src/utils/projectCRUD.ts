import type {
  ErrorResponse,
  ProjectCreateError,
  ProjectDeleteError,
  ProjectGetAllFilesError,
  ProjectGetError,
  ProjectListError,
  ProjectPatchError,
  ProjectShareGetError,
} from "@/models/errorSchema";
import type {
  Note,
  NoteCreateRequest,
  NoteUpdateRequest,
} from "@/models/noteSchema";
import type {
  ProjectCreateRequest,
  ProjectCreateResponse,
  ProjectDeleteResponse,
  ProjectGetAllFilesResponse,
  ProjectGetResponse,
  ProjectListResponse,
  ProjectPatchRequest,
  ProjectPatchResponse,
} from "@/models/projectSchema";
import type { ActiveTask } from "@/models/taskSchema";
import { useUserStore } from "@/stores/user";
import axiosI from "@/utils/axiosInstance";
import { showAxiosErrorToast } from "@/utils/toastService";

export async function createProject(createRequest: ProjectCreateRequest) {
  try {
    const response = await axiosI.post<ProjectCreateResponse>(
      "/project",
      createRequest
    );
    return response.data;
  } catch (e) {
    showAxiosErrorToast<ProjectCreateError>(e);
  }
}

export async function deleteProject(id: string) {
  try {
    await axiosI.delete<ProjectDeleteResponse>(`/project/${id}`);
  } catch (e) {
    showAxiosErrorToast<ProjectDeleteError>(e);
  }
}

export async function patchProject(
  id: string,
  patchRequest: ProjectPatchRequest
) {
  try {
    await axiosI.patch<ProjectPatchResponse>(`/project/${id}`, patchRequest);
  } catch (e) {
    showAxiosErrorToast<ProjectPatchError>(e);
  }
}

export async function projectActiveTasks(id: string) {
  try {
    const response = await axiosI.get<ActiveTask[]>(
      `/project/get_active_tasks/${id}`
    );
    return response.data;
  } catch (e) {
    showAxiosErrorToast<ErrorResponse>(e);
  }
}

export async function fetchProjectData(id: string) {
  try {
    const response = await axiosI.get<ProjectGetResponse>(`/project/${id}`);
    return response.data;
  } catch (e) {
    showAxiosErrorToast<ProjectGetError>(e);
  }
}

export async function fetchProjectsList() {
  try {
    const response = await axiosI.get<ProjectListResponse>("/project");
    return response.data;
  } catch (e) {
    showAxiosErrorToast<ProjectListError>(e);
    return [];
  }
}

export async function fetchCollabProjectsList() {
  const user = useUserStore();
  try {
    const response = await axiosI.get<ProjectListResponse>(
      `/project/share/projects/${user.user_id}`
    );
    return response.data;
  } catch (e) {
    showAxiosErrorToast<ProjectShareGetError>(e);
    return [];
  }
}

export async function fetchProjectFiles(id: string) {
  const userStore = useUserStore();
  try {
    const response = await axiosI.get<ProjectGetAllFilesResponse>(
      `/project/get_all_files/${id}`
    );
    return response.data;
  } catch (e) {
    showAxiosErrorToast<ProjectGetAllFilesError>(e);
  }
}

export async function getNotes(file_id: string) {
  try {
    const response = await axiosI.get<Note[]>(`/note/${file_id}`);
    return response.data;
  } catch (e) {
    showAxiosErrorToast<ErrorResponse>(e);
  }
}

export async function deleteNote(note_id: string) {
  try {
    await axiosI.delete(`/note/${note_id}`);
  } catch (e) {
    showAxiosErrorToast<ErrorResponse>(e);
  }
}

export async function updateNote(id: string, data: NoteUpdateRequest) {
  try {
    await axiosI.patch(`/note/${id}`, data);
  } catch (e) {
    showAxiosErrorToast<ErrorResponse>(e);
  }
}

export async function createNote(data: NoteCreateRequest) {
  try {
    await axiosI.post(`/note/${data.file_id}`, data);
  } catch (e) {
    showAxiosErrorToast<ErrorResponse>(e);
  }
}
