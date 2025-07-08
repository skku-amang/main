// packages/shared-types/src/user/login-user.dto.ts

import { IsEmail, IsNotEmpty, IsString } from "class-validator";

/**
 * @description 로그인에 사용될 순수 데이터 타입 (프론트엔드용)
 */
export type LoginUser = {
  email: string;
  password: string;
};

/**
 * @description 로그인에 사용될 DTO 클래스 (백엔드 유효성 검사용)
 */
export class LoginUserDto implements LoginUser {
  @IsEmail({}, { message: "유효한 이메일 주소를 입력해주세요." })
  @IsNotEmpty({ message: "이메일은 비워둘 수 없습니다." })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "비밀번호는 비워둘 수 없습니다." })
  password!: string;
}
