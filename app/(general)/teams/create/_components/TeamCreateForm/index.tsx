"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FieldErrors, useForm } from "react-hook-form"
import { z } from "zod"

import MemberSessionRequiredCheckbox from "@/app/(general)/teams/create/_components/TeamCreateForm/MemberSessionRequiredCheckbox"
import SecondPage from "@/app/(general)/teams/create/_components/TeamCreateForm/SecondPage"
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
import ROUTES from "@/constants/routes"
import fetchData from "@/lib/fetch"
import { CreateRetrieveUpdateResponse } from "@/lib/fetch/responseBodyInterfaces"
import { Performance } from "@/types/Performance"
import { Team } from "@/types/Team"

import { firstPageSchema } from "./schema"

interface TeamCreateFormProps {
  initialData?: any
  performanceOptions: Performance[]
}

const TeamCreateForm = ({
  initialData,
  performanceOptions
}: TeamCreateFormProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()

  // First Page
  const firstPageForm = useForm<z.infer<typeof firstPageSchema>>({
    resolver: zodResolver(firstPageSchema),
    defaultValues: {
      memberSessions: {
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
    }
  })
  function onFirstPageValid(formData: z.infer<typeof firstPageSchema>) {
    const firstPageResult = firstPageSchema.safeParse(formData)
    if (!firstPageResult.success) {
      // console.log(firstPageResult.error)
      return
    }

    setSecondPageSchemaMetadata(firstPageResult.data.memberSessions)
    setCurrentPage(2)
  }
  function onFirstPageInvalid(
    errors: FieldErrors<z.infer<typeof firstPageSchema>>
  ) {
    console.warn(errors)
  }

  // Second Page
  const [secondPageSchemaMetadata, setSecondPageSchemaMetadata] =
    useState<z.infer<any>>()
  async function onSecondPageValid(secondPageFormData: z.infer<any>) {
    let allFormData = {
      performanceId: firstPageForm.getValues("performanceId"),
      songName: firstPageForm.getValues("songName"),
      artistName: firstPageForm.getValues("artistName"),
      memberSessions: Object.values(secondPageFormData)
    }

    const res = await fetchData(API_ENDPOINTS.TEAM.CREATE, {
      cache: "no-store",
      body: JSON.stringify(allFormData)
    })
    const data = (await res.json()) as CreateRetrieveUpdateResponse<Team>
    router.push(ROUTES.TEAM.DETAIL(data.id).url)
  }
  function onSecondPageInvalid(errors: FieldErrors<z.infer<any>>) {
    console.warn("FormInvalid:", errors)
  }

  // Debug
  const formData = firstPageForm.watch()
  useEffect(() => {
    // console.log(formData)
  }, [formData])

  const memberSessionRequiredFormStructure: {
    [label: string]: string[]
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
              onValueChange={(e) => {
                firstPageForm.setValue("performanceId", +e)
                firstPageForm.clearErrors("performanceId")
              }}
            >
              <SelectTrigger
                className={
                  firstPageForm.formState.errors.performanceId &&
                  "border-destructive"
                }
                value="dd"
              >
                <SelectValue />
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
            {firstPageForm.formState.errors.performanceId && (
              <div className="text-destructive">
                {firstPageForm.formState.errors.performanceId.message}
              </div>
            )}

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
            <div>
              <Input
                {...firstPageForm.register("artistName")}
                className={
                  firstPageForm.formState.errors.artistName &&
                  "border-destructive"
                }
              />
              {firstPageForm.formState.errors.artistName && (
                <div className="text-destructive">
                  {firstPageForm.formState.errors.artistName.message}
                </div>
              )}
            </div>

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
            <table>
              <tbody>
                {Object.entries(memberSessionRequiredFormStructure).map(
                  ([label, fieldNames]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      {fieldNames.map((fieldName) => (
                        <td key={`${label}-${fieldName}`}>
                          <MemberSessionRequiredCheckbox
                            firstPageForm={firstPageForm}
                            fieldName={`memberSessions.${fieldName}` as any}
                            label={fieldName}
                          />
                        </td>
                      ))}
                    </tr>
                  )
                )}
              </tbody>
            </table>

            <Button type="submit">다음</Button>
          </form>
        </Form>
      )}
      {currentPage === 2 && (
        <SecondPage
          schemaMetadata={secondPageSchemaMetadata}
          onValid={onSecondPageValid}
          onInvalid={onSecondPageInvalid}
          onPreviousButtonClick={() => setCurrentPage(1)}
        />
      )}
    </div>
  )
}

export default TeamCreateForm
