import { IsNumber, IsOptional } from "class-validator";
import { IsInHalfSteps } from "../decorators/is-in-half-steps.decorator";

export class CreateGenerationDto {
  @IsNumber({}, { message: "기수는 숫자여야 합니다." })
  @IsInHalfSteps({ message: "기수는 0.5 단위여야 합니다." })
  order!: number;

  @IsOptional()
  @IsNumber({}, { message: "리더 ID는 숫자여야 합니다." })
  leaderId?: number;
}
