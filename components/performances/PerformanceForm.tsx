'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

import SimpleDateField from '../common/Form/SimpleDateField'
import SimpleImageField from '../common/Form/SimpleImageField'
import SimpleStringField from '../common/Form/SimpleStringField'
import { Button } from '../ui/button'
import { Form } from '../ui/form'
import PerformanceCard from './PerformanceCard'

const MAX_FILE_SIZE = 5000000 // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]

const formSchema = z.object({
  name: z
    .string({ required_error: '필수 항목' })
    .min(2, { message: '최소 2자' })
    .max(50, { message: '최대 50자' }),
  description: z.string().optional(),
  representativeImage: zfd
    .file()
    .refine((file) => file.size < MAX_FILE_SIZE, {
      message: "File can't be bigger than 5MB."
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: `파일 확장자는 ${ACCEPTED_IMAGE_TYPES.map((t) => t.replace('image/', '')).join(', ')} 만 가능합니다.`
    })
    .optional(),
  location: z.string().optional(),
  start_datetime: z.date().optional(),
  end_datetime: z.date().optional()
})

const PerformanceForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })

  // Watch all form values
  const formValues = form.watch()

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 카드 미리보기 */}
      <div className="grid-cols-1">
        <div className="flex h-full w-full items-center justify-center">
          <PerformanceCard
            id={0}
            name={formValues.name || '공연 이름'}
            representativeSrc={
              formValues.representativeImage
                ? URL.createObjectURL(formValues.representativeImage)
                : '/no-image.svg'
            }
            description={formValues.description}
            location={formValues.location || '미정'}
            startDatetime={formValues.start_datetime || new Date()}
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
                name="start_datetime"
                label="시작 일시"
                required={
                  !(formSchema.shape.start_datetime instanceof z.ZodOptional)
                }
              />
              <SimpleDateField
                form={form}
                name="end_datetime"
                label="종료 일시"
                required={
                  !(formSchema.shape.end_datetime instanceof z.ZodOptional)
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
