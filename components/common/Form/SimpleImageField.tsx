import { FormControl, FormField, FormItem, FormMessage } from '../../ui/form'
import { Input } from '../../ui/input'
import SimpleDescription from './SimpleDescription'
import SimpleLabel from './SimpleLabel'
import { useState } from 'react'
// import Image from 'next/image'

interface Prop {
  form: any
  name: string
  label: string
  description?: string
  required?: boolean
  acceptedImageTypes?: string[]
}

const SimpleImageField = ({
  form,
  name,
  label,
  description,
  required,
  acceptedImageTypes
}: Prop) => {
  acceptedImageTypes = acceptedImageTypes ?? [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]

  const [imagePreview, setImagePreview] = useState('')

  // 이미지 미리보기를 처리하는 함수
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] // 파일 선택
    if (file) {
      const reader = new FileReader() // FileReader 객체 생성
      reader.onloadend = () => {
        setImagePreview(reader.result as string) // 파일 읽기가 끝나면 base64로 변환된 결과 저장
      }
      reader.readAsDataURL(file) // 파일을 base64 형식으로 읽기
    }
  }

  return (
    <FormField
      control={form.control}
      name={name}
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      render={({ field: { value, onChange, ...fieldProps } }) => (
        <FormItem>
          <SimpleLabel required={required}>{label}</SimpleLabel>

          <FormControl>
            <>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="profile image"
                  style={{ maxWidth: '100px', marginBottom: '1rem' }}
                />
              )}

              <Input
                type="file"
                {...fieldProps}
                accept={acceptedImageTypes.join(',')}
                onChange={(event) => {
                  handleImageChange(event) // 파일 선택 시 이미지 미리보기 처리
                  onChange(event) // 기존 onChange도 호출 (폼 데이터에 파일 포함)
                }}
                className="hover:cursor-pointer"
                style={{ marginTop: '0.2rem' }}
              />
            </>
          </FormControl>

          <SimpleDescription>{description}</SimpleDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default SimpleImageField
