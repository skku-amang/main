/* eslint-disable no-unused-vars */
import { CircleAlert } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Form } from "@repo/ui/form"

import Description from "../Description"
import Paginator from "../Paginator"
import MemberSessionRequiredCheckbox from "./MemberSessionRequiredCheckbox"
import { memberSessionRequiredBaseSchema } from "./schema"

interface SecondPageProps {
  form: ReturnType<
    typeof useForm<z.infer<typeof memberSessionRequiredBaseSchema>>
  >
  onValid: (formData: z.infer<any>) => void
  onInvalid: (formData: z.infer<any>) => void
  onPrevious: () => void
}

const SecondPage = ({
  form,
  onValid,
  onInvalid,
  onPrevious
}: SecondPageProps) => {
  const memberSessionRequiredFormStructure: {
    [label: string]: string[]
  } = {
    보컬: ["보컬1", "보컬2", "보컬3"],
    기타: ["기타1", "기타2", "기타3"],
    "베이스 및 드럼": ["베이스1", "베이스2", "드럼1"],
    신디: ["신디1", "신디2", "신디3"],
    "그 외": ["관악기1", "현악기1"]
  }

  return (
    <Form {...form}>
      <form>
        {/* 세션 초기화 폼 */}
        <div>
          {/* 설명 */}
          <Description header="세션 정보" className="mb-6">
            <CircleAlert className="h-2.5 w-2.5 text-gray-600 md:h-4 md:w-4" />
            곡에 필요한 모든 세션을 체크해주세요
          </Description>

          {/* 세션 체크박스 */}
          <table className="md:table-auto">
            <tbody className="text-gray-900">
              {Object.entries(memberSessionRequiredFormStructure).map(
                ([label, fieldNames]) => (
                  <tr key={label}>
                    <td className="text-xs font-normal md:w-52 md:text-base">
                      {label}
                    </td>
                    {fieldNames.map((fieldName) => (
                      <td
                        key={`${label}-${fieldName}`}
                        className="px-1 py-3 md:p-4"
                      >
                        <MemberSessionRequiredCheckbox
                          secondPageForm={form}
                          fieldName={fieldName}
                          label={fieldName}
                        />
                      </td>
                    ))}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지 이동 */}
        <Paginator
          onPrevious={onPrevious}
          onNext={form.handleSubmit(onValid, onInvalid)}
          totalPage={3}
          currentPage={2}
          className="mt-8 md:mt-24"
        />
      </form>
    </Form>
  )
}

export default SecondPage
