export interface ProjectCreateRequest {
    name: string;
    description: string;
}

export interface ProjectCreateResponse {
    id: string;
    name: string;
    description: string;
    created_date: string;
    last_modified_date: string;
}