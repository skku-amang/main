import { CreateGenerationDto } from "./create-generation.dto";
import { PartialType } from "@nestjs/mapped-types";

export class UpdateGenerationDto extends PartialType(CreateGenerationDto) {}
