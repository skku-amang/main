import { z } from "zod"

import YoutubeVideo from "@/lib/youtube"

export const songYoutubeVideoUrlSchema = z
  .string()
  .optional()
  .refine(
    (value) => !value || (value.length >= 5 && YoutubeVideo.isUrlValid(value)),
    { message: "유효한 YouTube URL을 입력해주세요" }
  )
const basicInfoSchema = z.object({
  performanceId: z.number({ required_error: "필수 항목" }),
  isFreshmenFixed: z.boolean().default(false).optional(),
  songYoutubeVideoUrl: songYoutubeVideoUrlSchema,
  posterImage: z.string().optional(),
  songName: z
    .string({ required_error: "필수 항목" })
    .min(1, { message: "1글자 이상 입력해주세요" }),
  songArtist: z
    .string({ required_error: "필수 항목" })
    .min(1, { message: "1글자 이상 입력해주세요" }),
  isSelfMade: z.boolean().default(false).optional(),
  description: z.string().optional()
})
export default basicInfoSchema
