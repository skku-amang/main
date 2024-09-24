/* eslint-disable no-unused-vars */
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { FieldErrors, useForm } from "react-hook-form"
import { AiFillExclamationCircle } from "react-icons/ai"
import { z } from "zod"

import Description from "@/app/(general)/teams/create/_components/TeamCreateForm/Description"
import Paginator from "@/app/(general)/teams/create/_components/TeamCreateForm/Paginator"
import { memberSessionRequiredBaseSchema } from "@/app/(general)/teams/create/_components/TeamCreateForm/SecondPage/schema"
import UserSelect from "@/app/(general)/teams/create/_components/TeamCreateForm/ThirdPage/UserSelect"
import { Form } from "@/components/ui/form"
import API_ENDPOINTS from "@/constants/apiEndpoints"
import fetchData from "@/lib/fetch"
import { User } from "@/types/User"

import { createDynamicSchema, getFormDefaultValeus } from "../schema"

interface ThirdPageProps {
  schemaMetadata: z.infer<typeof memberSessionRequiredBaseSchema>
  onValid: (formData: z.infer<any>) => void
  onInvalid: (errors: FieldErrors<z.infer<any>>) => void
  onPreviousButtonClick: () => void
  firstPageForm: ReturnType<typeof useForm<any>>
}

const requiredMemberCount = (shape: any) => {
  return shape._def.innerType._def.schema._def
    .shape()
    .requiredMemberCount.default()
    ._def.innerType._def.defaultValue()
}

const ThirdPage = ({
  schemaMetadata,
  onValid,
  onInvalid,
  onPreviousButtonClick
}: ThirdPageProps) => {
  const [users, setMembers] = useState<User[]>([])
  const schema = createDynamicSchema(schemaMetadata)
  const session = useSession()

  // 유저 목록 가져오기
  useEffect(() => {
    fetchData(API_ENDPOINTS.USER.LIST, {
      cache: "no-cache",
      headers: {
        Authorization: `Bearer ${session.data?.access}`
      }
    })
      .then((data) => data.json())
      .then((users) => setMembers(users))
  }, [session.data?.access])

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: getFormDefaultValeus(schemaMetadata)
  })

  return (
    <Form {...form}>
      <form>
        <Description header="팀원 정보" className="mb-6">
          <AiFillExclamationCircle />
          이미 멤버가 확정된 세션의 경우, 해당 세션에 체크표시 후 멤버를
          선택해주세요
          <br />
          멤버모집이 필요한 세션의 경우, 체크표시가 되어 있지 않아야 합니다
        </Description>

        {/* 팀원 정보 입력 */}
        <table className="table-auto border-separate border-spacing-5">
          <tbody>
            {Object.entries(schema.shape).map(([key, s]) => {
              return Array.from({ length: requiredMemberCount(s) }).map(
                (_, index) => (
                  <tr key={`${key}-${index}`} className="my-3">
                    <td className="w-32">
                      {key}
                      {index + 1}
                    </td>
                    <td>
                      <UserSelect
                        key={`${key}-${index}`}
                        users={users}
                        form={form}
                        fieldName={`${key}.members`}
                        fieldArrayIndex={index}
                      />
                    </td>
                  </tr>
                )
              )
            })}
          </tbody>
        </table>

        {/* 디바이더 */}
        <hr className="my-14" />

        {/* 페이지 이동 */}
        <Paginator
          nextButtonLabel="Complete"
          onPrevious={onPreviousButtonClick}
          onNext={form.handleSubmit(onValid, onInvalid)}
          totalPage={3}
          currentPage={3}
        />
      </form>
    </Form>
  )
}

export default ThirdPage
