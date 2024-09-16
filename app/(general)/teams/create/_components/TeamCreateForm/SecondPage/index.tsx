/* eslint-disable no-unused-vars */
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { FieldErrors, useForm } from "react-hook-form"
import { z } from "zod"

import UserSelect from "@/app/(general)/teams/create/_components/TeamCreateForm/SecondPage/UserSelect"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import API_ENDPOINTS from "@/constants/apiEndpoints"
import fetchData from "@/lib/fetch"
import { User } from "@/types/User"

import { createDynamicSchema } from "../schema"

// 참고: 다른 방법: schema를 받아서 오지 말고 metaData를 받아서 이 컴포넌트에서 schema와 form 생성
interface SecondPageProps {
  schema: ReturnType<typeof createDynamicSchema>
  onValid: (formData: z.infer<any>) => void
  onInvalid: (errors: FieldErrors<z.infer<any>>) => void
}

const requiredMemberCount = (shape: any) =>
  shape._def.schema._def
    .shape()
    .requiredMemberCount.default()
    ._def.innerType._def.defaultValue()

const SecondPage = ({
  schema,
  onValid: _onValid,
  onInvalid: _onInvalid
}: SecondPageProps) => {
  const [users, setMembers] = useState<User[]>([])

  useEffect(() => {
    fetchData(API_ENDPOINTS.USER.LIST)
      .then((data) => data.json())
      .then((users) => setMembers(users))
  }, [])

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema)
  })

  function onValid(formData: z.infer<typeof schema>) {
    _onValid(formData)
  }
  function onInvalid(errors: FieldErrors<z.infer<typeof schema>>) {
    _onInvalid(errors)
  }

  const formData = form.watch()
  useEffect(() => {
    console.log(formData)
  }, [formData])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onValid, onInvalid)}>
        <table>
          <tbody>
            {Object.entries(schema.shape).map(([key, s]) => {
              return Array.from({ length: requiredMemberCount(s) }).map(
                (_, index) => (
                  <tr key={`${key}-${index}`}>
                    <td>
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

        <Button type="submit">다음</Button>
      </form>
    </Form>
  )
}

export default SecondPage
