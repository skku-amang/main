import { z } from "zod"

const basicInfoSchema = z.object({
  performanceId: z.number({ required_error: "필수 항목" }),
  songName: z
    .string({ required_error: "필수 항목" })
    .min(1, { message: "1글자 이상 입력해주세요" }),
  songArtist: z
    .string({ required_error: "필수 항목" })
    .min(1, { message: "1글자 이상 입력해주세요" }),
  isFreshmenFixed: z.boolean().default(false).optional(),
  isSelfMade: z.boolean().default(false).optional(),
  description: z.string().optional()
})
export default basicInfoSchema
