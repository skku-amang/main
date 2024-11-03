"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { StatusCodes } from "http-status-codes"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zfd } from "zod-form-data"

import SimpleDateField from "@/components/Form/SimpleDateField"
import SimpleImageField from "@/components/Form/SimpleImageField"
import SimpleStringField from "@/components/Form/SimpleStringField"
import { useToast } from "@/components/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import API_ENDPOINTS, { ApiEndpoint } from "@/constants/apiEndpoints"
import ROUTES from "@/constants/routes"
import fetchData from "@/lib/fetch"
import { CreateRetrieveUpdateResponse } from "@/lib/fetch/responseBodyInterfaces"
import { Performance } from "@/types/Performance"

import PerformanceCard from "./PerformanceCard"

const MAX_FILE_SIZE = 5000000 // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp"
]

const formSchema = z.object({
  name: z
    .string({ required_error: "필수 항목" })
    .min(2, { message: "최소 2자" })
    .max(50, { message: "최대 50자" }),
  description: z.string().optional(),
  representativeImage: zfd
    .file()
    .refine((file) => file.size < MAX_FILE_SIZE, {
      message: "File can't be bigger than 5MB."
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: `파일 확장자는 ${ACCEPTED_IMAGE_TYPES.map((t) => t.replace("image/", "")).join(", ")} 만 가능합니다.`
    })
    .optional(),
  location: z.string().optional(),
  startDatetime: z.date().optional(),
  endDatetime: z.date().optional()
})

const PerformanceForm = () => {
  const session = useSession()
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })

  // Watch all form values
  const formValues = form.watch()

  async function onSubmit(formData: z.infer<typeof formSchema>) {
    const formDataToSend = new FormData()
    formDataToSend.append("name", formData.name)
    if (formData.description) {
      formDataToSend.append("description", formData.description)
    }
    if (formData.representativeImage) {
      formDataToSend.append("representativeImage", formData.representativeImage)
    }
    if (formData.location) {
      formDataToSend.append("location", formData.location)
    }
    if (formData.startDatetime) {
      formDataToSend.append(
        "startDatetime",
        formData.startDatetime.toISOString()
      )
    }
    if (formData.endDatetime) {
      formDataToSend.append("endDatetime", formData.endDatetime.toISOString())
    }

    const res = await fetchData(API_ENDPOINTS.PERFORMANCE.CREATE as ApiEndpoint, {
      headers: {
        Authorization: `Bearer ${session.data?.access}`
      },
      body: formDataToSend
    })

    if (!res.ok) {
      const data = await res.json()
      switch (res.status) {
        case StatusCodes.BAD_REQUEST:
          toast({
            title: res.statusText,
            description: data.detail,
            variant: "destructive"
          })
          break
        default:
          toast({
            title: res.statusText,
            description: data.detail,
            variant: "destructive"
          })
          break
      }
      return
    }

    toast({
      title: "공연 생성 성공",
      description: "성공적으로 공연이 생성되었습니다!"
    })
    const data = (await res.json()) as CreateRetrieveUpdateResponse<Performance>
    router.push(ROUTES.PERFORMANCE.DETAIL(data.id))
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 카드 미리보기 */}
      <div className="grid-cols-1">
        <div className="flex h-full w-full items-center justify-center">
          <PerformanceCard
            id={0}
            name={formValues.name || "공연 이름"}
            representativeSrc={
              formValues.representativeImage
                ? URL.createObjectURL(formValues.representativeImage)
                : "/no-image.svg"
            }
            description={formValues.description}
            location={formValues.location || "미정"}
            startDatetime={formValues.startDatetime || new Date()}
            className="shadow-2xl hover:cursor-pointer"
          />
        </div>
      </div>

      {/* 양식 입력 */}
      <div className="grid-cols-1">
        <div className="flex h-full w-full items-center justify-center">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6"
            >
              <SimpleStringField
                form={form}
                name="name"
                label="이름"
                placeholder="2024년 1학기 정기공연"
                required={!(formSchema.shape.name instanceof z.ZodOptional)}
              />
              <SimpleStringField
                form={form}
                name="description"
                label="설명"
                placeholder="신입 부원들과 함께하는 2024년 첫 공연입니다. 많은 참여 부탁드려요!"
                required={
                  !(formSchema.shape.description instanceof z.ZodOptional)
                }
              />
              <SimpleImageField
                form={form}
                name="representativeImage"
                label="대표 이미지"
                required={
                  !(
                    formSchema.shape.representativeImage instanceof
                    z.ZodOptional
                  )
                }
                acceptedImageTypes={ACCEPTED_IMAGE_TYPES}
              />
              <SimpleStringField
                form={form}
                name="location"
                label="위치"
                placeholder="홍대 롤러코스터"
                description="공연장의 주소 입니다."
                required={!(formSchema.shape.location instanceof z.ZodOptional)}
              />
              <SimpleDateField
                form={form}
                name="startDatetime"
                label="시작 일시"
                required={
                  !(formSchema.shape.startDatetime instanceof z.ZodOptional)
                }
              />
              <SimpleDateField
                form={form}
                name="endDatetime"
                label="종료 일시"
                required={
                  !(formSchema.shape.endDatetime instanceof z.ZodOptional)
                }
              />

              <div className="flex justify-end">
                <Button type="submit">제출</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default PerformanceForm
