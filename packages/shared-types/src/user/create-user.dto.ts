import { IsEmail, IsNotEmpty, Matches, MinLength } from "class-validator";
import { PASSWORD_REGEX } from "../constants/regex";
/**
 * @description 유저 생성을 위한 순수 데이터 타입 (프론트엔드용)
 */
export type CreateUser = {
  email: string;
  password: string;
  name: string;
  nickname: string;
};

/**
 * @description 유저 생성을 위한 DTO 클래스 (백엔드 유효성 검사용)
 */
export class CreateUserDto implements CreateUser {
  @IsEmail(undefined, { message: "유효한 이메일 주소를 입력해주세요." })
  @IsNotEmpty({ message: "이메일은 비워둘 수 없습니다." })
  email!: string;

  @IsNotEmpty({ message: "비밀번호는 비워둘 수 없습니다." })
  @MinLength(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." })
  @Matches(PASSWORD_REGEX, {
    message: "비밀번호는 영문, 숫자를 모두 포함해야 합니다.",
  })
  password!: string;

  @IsNotEmpty({ message: "이름은 비워둘 수 없습니다." })
  name!: string;

  @IsNotEmpty({ message: "닉네임은 비워둘 수 없습니다." })
  nickname!: string;
}
