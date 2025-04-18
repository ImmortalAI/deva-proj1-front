export interface LoginUserRequest {
    login: string;
    password: string;
}

export interface RegisterUserRequest {
    login: string;
    password: string;
    password_repeat: string;
}

export interface User {
    login: string;
}