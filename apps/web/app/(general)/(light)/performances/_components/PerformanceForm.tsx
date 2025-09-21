"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"

import SimpleDateField from "@/components/Form/SimpleDateField"
import SimpleImageField from "@/components/Form/SimpleImageField"
import SimpleStringField from "@/components/Form/SimpleStringField"
import { useToast } from "@/components/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import ROUTES from "@/constants/routes"

import { useCreatePerformance } from "@/hooks/api/usePerformance"
import {
  ACCEPTED_IMAGE_TYPES,
  CreatePerformanceSchema
} from "@repo/shared-types"
import PerformanceCard from "./PerformanceCard"

const PerformanceForm = () => {
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof CreatePerformanceSchema>>({
    resolver: zodResolver(CreatePerformanceSchema)
  })
  const { mutate, isError, data } = useCreatePerformance()

  // Watch all form values
  const formValues = form.watch()

  async function onSubmit(formData: z.infer<typeof CreatePerformanceSchema>) {
    formData.posterImage = formData.posterImage || undefined
    mutate(formData)

    if (isError || data === undefined) {
      toast({
        title: "공연 생성 중",
        description: "잠시만 기다려주세요..."
      })
      return
    }

    toast({
      title: "공연 생성 성공",
      description: "성공적으로 공연이 생성되었습니다!"
    })
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
            posterSrc={
              formValues.posterImage
                ? URL.createObjectURL(formValues.posterImage)
                : "/no-image.svg"
            }
            description={formValues.description}
            location={formValues.location || "미정"}
            startAt={formValues.startAt || new Date()}
            className="shadow-2xl hover:cursor-pointer"
          />
        </div>
      </div>

      {/* 양식 입력 */}
      <div className="grid-cols-1">
        <div className="flex h-full w-full items-center justify-center">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, (error) => {
                console.error(error)
                toast({
                  title: "제출 실패",
                  description: "입력한 내용을 확인해주세요.",
                  variant: "destructive"
                })
              })}
              className="w-full space-y-6"
            >
              <SimpleStringField
                form={form}
                name="name"
                label="이름"
                placeholder="2024년 1학기 정기공연"
                required={
                  !(CreatePerformanceSchema.shape.name instanceof z.ZodOptional)
                }
              />
              <SimpleStringField
                form={form}
                name="description"
                label="설명"
                placeholder="신입 부원들과 함께하는 2024년 첫 공연입니다. 많은 참여 부탁드려요!"
                required={
                  !(
                    CreatePerformanceSchema.shape.description instanceof
                    z.ZodOptional
                  )
                }
              />
              <SimpleImageField
                form={form}
                name="posterImage"
                label="대표 이미지"
                required={
                  !(
                    CreatePerformanceSchema.shape.posterImage instanceof
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
                required={
                  !(
                    CreatePerformanceSchema.shape.location instanceof
                    z.ZodOptional
                  )
                }
              />
              <SimpleDateField
                form={form}
                name="startAt"
                label="시작 일시"
                required={
                  !(
                    CreatePerformanceSchema.shape.startAt instanceof
                    z.ZodOptional
                  )
                }
              />
              <SimpleDateField
                form={form}
                name="endAt"
                label="종료 일시"
                required={
                  !(
                    CreatePerformanceSchema.shape.endAt instanceof z.ZodOptional
                  )
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
