import { z } from "zod";
import { createZodDto } from "nestjs-zod";

/**
 * @description 로그인에 사용될 Zod 스키마
 * 이메일과 비밀번호를 포함합니다.
 */
export const LoginUserSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "이메일은 비워둘 수 없습니다." })
      .email({
        message: "유효한 이메일 주소를 입력해주세요.",
      }),
    password: z.string().min(1, { message: "비밀번호는 비워둘 수 없습니다." }),
  })
  .strict();

/**
 * @description 로그인에 사용될 DTO 클래스 (백엔드용)
 */
export class LoginUserDto extends createZodDto(LoginUserSchema) {}

/**
 * @description 로그인에 사용될 순수 데이터 타입 (프론트엔드용)
 */
export type LoginUser = z.infer<typeof LoginUserSchema>;
