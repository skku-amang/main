/* eslint-disable no-unused-vars */
import { CircleAlert } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { FieldErrors, useForm } from "react-hook-form"
import { z } from "zod"

import { Form } from "@/components/ui/form"
import API_ENDPOINTS from "@/constants/apiEndpoints"
import fetchData from "@/lib/fetch"
import { User } from "@/types/User"

import Description from "../Description"
import Paginator from "../Paginator"
import { memberSessionRequiredBaseSchema } from "../SecondPage/schema"
import UserSelect from "./UserSelect"

interface ThirdPageProps {
  form: ReturnType<
    typeof useForm<z.infer<typeof memberSessionRequiredBaseSchema>>
  >
  onValid: (formData: z.infer<any>) => void
  onInvalid: (errors: FieldErrors<z.infer<any>>) => void
  onPrevious: () => void
  firstPageForm: ReturnType<typeof useForm<any>>
}

const ThirdPage = ({
  form,
  onValid,
  onInvalid,
  onPrevious
}: ThirdPageProps) => {
  const [users, setMembers] = useState<User[]>([])
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

  return (
    <Form {...form}>
      <form>
        <Description header="팀원 정보" className="mb-6">
          <CircleAlert />
          이미 멤버가 확정된 세션의 경우, 해당 세션에 체크표시 후 멤버를
          선택해주세요
          <br />
          멤버모집이 필요한 세션의 경우, 체크표시가 되어 있지 않아야 합니다
        </Description>

        {/* 팀원 정보 입력 */}
        <table className="table-auto border-separate border-spacing-5">
          <tbody>
            {Object.values(form.getValues()).map((formValue) => {
              const { session, required, index } = formValue
              const fieldName = `${session}${index}.member`
              if (!required) return
              return (
                <tr key={`${session}-${index}`} className="my-3">
                  <td className="w-32">
                    {session}
                    {index}
                  </td>
                  <td>
                    <UserSelect
                      users={users}
                      form={form}
                      fieldName={fieldName}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* 페이지 이동 */}
        <Paginator
          onPrevious={onPrevious}
          onNext={form.handleSubmit(onValid, onInvalid)}
          totalPage={3}
          currentPage={3}
        />
      </form>
    </Form>
  )
}

export default ThirdPage
