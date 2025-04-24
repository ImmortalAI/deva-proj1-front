export interface AuthSingleMessage {
    message: string;
}

export interface AuthLoginRequest {
    login: string;
    password: string;
}

export type AuthLoginResponse = AuthSingleMessage;

export interface RegisterRequest {
    login: string;
    password: string;
    password_repeat: string;
}

export type AuthRegisterResponse = AuthSingleMessage;

export interface AuthUserInfoResponse {
    id: string;
    login: string;
}

export type AuthLogoutResponse = AuthSingleMessage;

export type AuthLogoutAllResponse = AuthSingleMessage;

export type AuthRefreshResponse = AuthSingleMessage;

export type AuthUpdateCredentialsResponse = AuthSingleMessage;