export interface ErrorResponse {
  detail: string;
}

// #region Auth Errors
// AuthRegisterError is just a HTTP Error 500

export type AuthLoginError = ErrorResponse;

export type AuthLogoutError = ErrorResponse;

export type AuthUserInfoError = ErrorResponse;

export type AuthLogoutAllError = ErrorResponse;

export type AuthRefresh = ErrorResponse;

// Update Credentials can drop an Error 500 (username is already exist)

export type AuthUpdateCredentialsError = ErrorResponse;
// #endregion

// #region Project Errors
export type ProjectCreateError = ErrorResponse;

export type ProjectDeleteError = ErrorResponse;

export type ProjectPatchError = ErrorResponse;

export type ProjectGetError = ErrorResponse;

export type ProjectGetAllFilesError = ErrorResponse;

export type ProjectListError = ErrorResponse;
// #endregion

// #region File Errors
export type FileUploadError = ErrorResponse;
// #endregion