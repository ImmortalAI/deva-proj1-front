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
import axios from "axios";

export async function createProject(createRequest: ProjectCreateRequest) {
  try {
    const response = await axios.post<ProjectCreateResponse>(
      "/api/project",
      createRequest
    );
    return response.data;
  } catch (e) {
    console.log(e); //FIXME
  }
}

export async function deleteProject(id: string) {
  try {
    await axios.delete<ProjectDeleteResponse>(`/api/project/${id}`);
  } catch (e) {
    console.log(e); //FIXME
  }
}

export async function patchProject(
  id: string,
  patchRequest: ProjectPatchRequest
) {
  try {
    await axios.patch<ProjectPatchResponse>(`/api/project/${id}`, patchRequest);
  } catch (e) {
    console.log(e); //FIXME
  }
}

export async function projectActiveTasks(id: string) {
  try {
    const response = await axios.get<ActiveTask[]>(
      `/api/project/get_active_tasks/${id}`
    );
    return response.data;
  } catch (e) {
    console.log(e); //FIXME
  }
}

export async function fetchProjectData(id: string) {
  try {
    const response = await axios.get<ProjectGetResponse>(`/api/project/${id}`);
    return response.data;
  } catch (e) {
    console.log(e); //FIXME
  }
}

export async function fetchProjectsList() {
  try {
    const response = await axios.get<ProjectListResponse>("/api/project");
    return response.data;
  } catch (e) {
    console.log(e); //FIXME
  }
}

export async function fetchProjectFiles(id: string) {
  const userStore = useUserStore();
  try {
    const response = await axios.get<ProjectGetAllFilesResponse>(
      `/api/project/get_all_files/${id}`
    );
    return response.data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 401) {
      await userStore.fetchUserData();
    } else {
      console.log(e); //FIXME
    }
  }
}

export async function getNotes(file_id: string) {
  try {
    const response = await axios.get<Note[]>(`/api/note/${file_id}`);
    return response.data;
  } catch (e) {
    console.log(e); //FIXME
  }
}

export async function deleteNote(note_id: string) {
  try {
    await axios.delete(`/api/note/${note_id}`);
  } catch (e) {
    console.log(e); //FIXME
  }
}

export async function updateNote(id: string, data: NoteUpdateRequest) {
  try {
    await axios.patch(`/api/note/${id}`, data);
  } catch (e) {
    console.log(e); //FIXME
  }
}

export async function createNote(data: NoteCreateRequest) {
  try {
    await axios.post(`/api/note`, data);
  } catch (e) {
    console.log(e); //FIXME
  }
}
