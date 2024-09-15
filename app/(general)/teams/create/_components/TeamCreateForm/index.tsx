"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { FieldErrors, useForm } from "react-hook-form"
import { z } from "zod"

import MemberSessionRequiredCheckbox from "@/app/(general)/teams/create/_components/TeamCreateForm/MemberSessionRequiredCheckbox"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import API_ENDPOINTS from "@/constants/apiEndpoints"
import fetchData from "@/lib/fetch"
import { Performance } from "@/types/Performance"
import { User } from "@/types/User"

import { firstPageSchema, memberSessionInitSchema } from "./schema"

interface TeamCreateFormProps {
  initialData?: any
  performanceOptions: Performance[]
}

const TeamCreateForm = ({
  initialData,
  performanceOptions
}: TeamCreateFormProps) => {
  const [currentPage, setCurrentPage] = useState(1)

  const [users, setMembers] = useState<User[]>([])
  useEffect(() => {
    fetchData(API_ENDPOINTS.USER.LIST)
      .then((data) => data.json())
      .then((users) => setMembers(users))
  }, [])

  const firstPageForm = useForm<z.infer<typeof firstPageSchema>>({
    resolver: zodResolver(firstPageSchema),
    defaultValues: {
      // 보컬1 부터 관악기 까지 모두 초기화
      보컬1: { required: false },
      보컬2: { required: false },
      보컬3: { required: false },
      기타1: { required: false },
      기타2: { required: false },
      기타3: { required: false },
      베이스1: { required: false },
      베이스2: { required: false },
      드럼: { required: false },
      신디1: { required: false },
      신디2: { required: false },
      신디3: { required: false },
      현악기: { required: false },
      관악기: { required: false }
    }
  })
  const memberSessionInitForm = useForm<
    z.infer<typeof memberSessionInitSchema>
  >({
    resolver: zodResolver(memberSessionInitSchema)
  })

  function onFirstPageValid(formData: z.infer<typeof firstPageSchema>) {
    const firstPageResult = firstPageSchema.safeParse(formData)
    if (!firstPageResult.success) {
      // 오류 처리
      console.log(firstPageResult.error)
      return
    }
    // 다음 페이지로 이동
    setCurrentPage(2)
  }
  function onFirstPageInvalid(
    errors: FieldErrors<z.infer<typeof firstPageSchema>>
  ) {
    console.warn(errors)
  }

  const formData = firstPageForm.watch()
  useEffect(() => {
    console.log(formData)
  }, [formData])

  const memberSessionRequiredFormStructure: {
    [label: string]: (keyof z.infer<typeof firstPageSchema>)[]
  } = {
    보컬: ["보컬1", "보컬2", "보컬3"],
    기타: ["기타1", "기타2", "기타3"],
    "베이스 및 드럼": ["베이스1", "베이스2", "드럼"],
    신디: ["신디1", "신디2", "신디3"],
    "그 외": ["관악기", "현악기"]
  }

  return (
    <div>
      {currentPage === 1 && (
        <Form {...firstPageForm}>
          <form
            onSubmit={firstPageForm.handleSubmit(
              onFirstPageValid,
              onFirstPageInvalid
            )}
          >
            {/* 공연 선택 */}
            <Select
              {...firstPageForm.register("performanceId")}
              onValueChange={(e) => firstPageForm.setValue("performanceId", +e)}
            >
              <SelectTrigger>
                <SelectValue>
                  {
                    performanceOptions.find(
                      (performance) =>
                        performance.id ===
                        firstPageForm.getValues("performanceId")
                    )?.name
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {performanceOptions.map((performance) => (
                  <SelectItem
                    key={performance.id}
                    value={performance.id.toString()}
                  >
                    {performance.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 곡 입력 */}
            <div>
              <Input
                {...firstPageForm.register("songName")}
                className={
                  firstPageForm.formState.errors.songName &&
                  "border-destructive"
                }
              />
              {firstPageForm.formState.errors.songName && (
                <div className="text-destructive">
                  {firstPageForm.formState.errors.songName.message}
                </div>
              )}
            </div>
            <Input {...firstPageForm.register("artistName")} />
            <Checkbox
              onCheckedChange={(e) =>
                firstPageForm.setValue("isFreshmenFixed", !!e)
              }
              checked={firstPageForm.getValues("isFreshmenFixed")}
            />
            <Checkbox
              onCheckedChange={(e) => firstPageForm.setValue("isSelfMade", !!e)}
              checked={firstPageForm.getValues("isSelfMade")}
            />

            {/* 세션 초기화 폼 */}
            <div className="grid grid-cols-4">
              {Object.entries(memberSessionRequiredFormStructure).map(
                ([label, fieldNames]) => (
                  <>
                    <div key={label}>{label}</div>
                    {fieldNames.map((fieldName) => (
                      <MemberSessionRequiredCheckbox
                        key={`${label}-${fieldName}`}
                        firstPageForm={firstPageForm}
                        fieldName={fieldName}
                        label={fieldName}
                      />
                    ))}
                  </>
                )
              )}
            </div>

            <Button type="submit">다음</Button>
          </form>
        </Form>
      )}
      {/* {currentPage === 2 && (
        <Form form={memberSessionRequiredForm} onSubmit={onValid}>
          {Object.keys(memberSessionRequiredForm.getValues()).map(
            (sessionName) => (
              <div key={sessionName}>
                <h2>{sessionName}</h2>
                {memberSessionRequiredForm
                  .getValues(sessionName)
                  .members.map((memberId) => (
                    <MemberSelect
                      key={memberId}
                      form={memberSessionRequiredForm}
                      memberSessionFieldName={sessionName}
                      users={users}
                    />
                  ))}
              </div>
            )
          )}
          <Button type="submit">제출</Button>
        </Form>
      )} */}
    </div>
  )
}

export default TeamCreateForm
