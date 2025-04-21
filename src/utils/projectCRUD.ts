import type { FileDownloadDataResponse, FileInfoResponse } from "@/models/fileScheme";
import type {
  ProjectCreateRequest,
  ProjectInfoResponse,
  ProjectPatchRequest,
} from "@/models/projectScheme";
import { useUserStore } from "@/stores/user";
import axios from "axios";

export async function createProject(createRequest: ProjectCreateRequest) {
  try {
    const response = await axios.post<ProjectInfoResponse>(
      "/api/project/create",
      createRequest
    );
    return response.data;
  } catch (e) {
    console.log(e); //FIXME
  }
}

export async function deleteProject(id: string) {
  try {
    await axios.delete(`/api/project`, {
      params: {
        project_id: id,
      },
    });
  } catch (e) {
    console.log(e); //FIXME
  }
}

export async function patchProject(patchRequest: ProjectPatchRequest) {
  try {
    await axios.patch(`/api/project`, patchRequest);
  } catch (e) {
    console.log(e); //FIXME
  }
}

export async function fetchProjects() {
  try {
    const response = await axios.get<ProjectInfoResponse[]>(
      "/api/project/list"
    );
    return response.data;
  } catch (e) {
    console.log(e); //FIXME
  }
}

export async function fetchProjectFiles(id: string) {
  const userStore = useUserStore();
  try {
    const response = await axios.get<FileDownloadDataResponse[]>(
      `/api/project/get_files/${id}`
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
