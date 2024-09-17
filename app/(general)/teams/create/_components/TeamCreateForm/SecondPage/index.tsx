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

import {
  createDynamicSchema,
  getFormDefaultValeus,
  memberSessionRequiredBaseSchema
} from "../schema"

interface SecondPageProps {
  schemaMetadata: z.infer<typeof memberSessionRequiredBaseSchema>
  onValid: (formData: z.infer<any>) => void
  onInvalid: (errors: FieldErrors<z.infer<any>>) => void
  onPreviousButtonClick: () => void
}

const requiredMemberCount = (shape: any) => {
  return shape._def.innerType._def.schema._def
    .shape()
    .requiredMemberCount.default()
    ._def.innerType._def.defaultValue()
}

const SecondPage = ({
  schemaMetadata,
  onValid: _onValid,
  onInvalid: _onInvalid,
  onPreviousButtonClick
}: SecondPageProps) => {
  const [users, setMembers] = useState<User[]>([])
  const schema = createDynamicSchema(schemaMetadata)

  // 유저 목록 가져오기
  useEffect(() => {
    fetchData(API_ENDPOINTS.USER.LIST)
      .then((data) => data.json())
      .then((users) => setMembers(users))
  }, [])

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: getFormDefaultValeus(schemaMetadata)
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

        <div className="flex items-center justify-between">
          <Button onClick={onPreviousButtonClick}>이전</Button>
          <Button type="submit">다음</Button>
        </div>
      </form>
    </Form>
  )
}

export default SecondPage
