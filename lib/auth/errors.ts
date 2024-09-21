import { CredentialsSignin } from 'next-auth'

// 공통
export const InvalidSigninErrorCode = 'base_auth_error'
export class InvalidSigninError extends CredentialsSignin {
  code = InvalidSigninErrorCode
}

export const InternalServerErrorCode = 'InternalServerError'
export class InternalServerError extends CredentialsSignin {
  code = InternalServerErrorCode
}

// 회원가입
export const InvalidSignupCredentialsErrorCode = 'Signup/BadRequest'
export class InvalidSignupCredentialsError extends CredentialsSignin {
  code = InvalidSignupCredentialsErrorCode
}

export const DuplicatedCredentialsErrorCode = 'Signup/Conflict'
export class DuplicatedCredentialsError extends CredentialsSignin {
  code = DuplicatedCredentialsErrorCode
}

// 로그인
export const InvalidSigninCredentialsErrorCode = 'Signin/Unauthorized'
export class InvalidSigninCredentialsError extends CredentialsSignin {
  code = InvalidSigninCredentialsErrorCode
}
