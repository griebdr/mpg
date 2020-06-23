export interface User {
  username: string;
  password?: string;
  email?: string;
  activated?: boolean;
}

export interface SignUpData {
  username: string;
  password?: string;
  email?: string;
}

export interface SignUpResponse {
  usernameErrorMsg?: string | undefined;
  passwordErrorMsg?: string | undefined;
  emailErrorMsg?: string | undefined;
  otherErrorMsg?: string | undefined;
  success: boolean;
}

export interface SingInData {
  username: string;
  password: string;
}

export interface SignInResponse {
  usernameErrorMsg?: string | undefined;
  passwordErrorMsg?: string | undefined;
  success: boolean; 
}