export interface ProjectCreateRequest {
    name: string;
    description: string;
}

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