"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FieldErrors, useForm } from "react-hook-form"
import { AiFillExclamationCircle } from "react-icons/ai"
import { z } from "zod"

import Description from "@/app/(general)/teams/create/_components/TeamCreateForm/Description"
import MemberSessionRequiredCheckbox from "@/app/(general)/teams/create/_components/TeamCreateForm/MemberSessionRequiredCheckbox"
import Paginator from "@/app/(general)/teams/create/_components/TeamCreateForm/paginator"
import SecondPage from "@/app/(general)/teams/create/_components/TeamCreateForm/SecondPage"
import { Checkbox } from "@/components/ui/checkbox"
import { Form } from "@/components/ui/form"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { cn } from "@/lib/utils"
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
      songArtist: firstPageForm.getValues("songArtist"),
      memberSessions: Object.values(secondPageFormData),
      description: firstPageForm.getValues("description")
    }

    const res = await fetchData(API_ENDPOINTS.TEAM.CREATE, {
      cache: "no-store",
      body: JSON.stringify(allFormData)
    })
    if (!res.ok) {
      switch (res.status) {
        case 400:
          console.error("Error:", await res.json())
          break
        case 401:
          console.error("Unauthorized")
          break
        default:
          console.error("Unknown error")
          break
      }
      return
    }
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
    <div className="m-20 rounded-2xl p-20 shadow-2xl">
      {currentPage === 1 && (
        <Form {...firstPageForm}>
          <form>
            {/* 공연 및 곡 폼 */}
            <div>
              {/* 설명 */}
              <Description header="공연 및 곡 정보" className="mb-6">
                <AiFillExclamationCircle />
                <HoverCard>
                  <HoverCardTrigger>
                    입력 시 주의사항을 확인해주세요
                  </HoverCardTrigger>
                  <HoverCardContent
                    className="w-[420px] bg-black text-white"
                    side="right"
                  >
                    ・곡명, 아티스트명을 정확히 입력해주세요
                    <br />
                    ・커버곡의 경우 아래의 예시와 같이 작성해주세요
                    <br />
                    (예) 곡명: 화장을 고치고(Cover by 태연) / 아티스트명: 왁스
                  </HoverCardContent>
                </HoverCard>
              </Description>

              <div className="grid grid-cols-2 gap-x-14 gap-y-6">
                {/* 공연 선택 */}
                <div>
                  <Label htmlFor="performanceIdInput" className="font-semibold">
                    공연 선택
                  </Label>
                  <Select
                    onValueChange={(e) => {
                      firstPageForm.setValue("performanceId", +e)
                      firstPageForm.clearErrors("performanceId")
                    }}
                  >
                    <SelectTrigger
                      id="performanceIdInput"
                      className={cn(
                        "mt-1",
                        firstPageForm.formState.errors.performanceId &&
                          "border-destructive"
                      )}
                    >
                      <SelectValue placeholder="공연 선택" />
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

                  {/* 에러 표시 */}
                  {firstPageForm.formState.errors.performanceId && (
                    <div className="text-destructive">
                      {firstPageForm.formState.errors.performanceId.message}
                    </div>
                  )}
                </div>
                <div></div>

                {/* 곡 입력 */}
                <div>
                  <Label htmlFor="songNameInput" className="font-semibold">
                    곡명
                  </Label>
                  <Input
                    id="songNameInput"
                    {...firstPageForm.register("songName")}
                    className={cn(
                      "my-1",
                      firstPageForm.formState.errors.songName &&
                        "border-destructive"
                    )}
                    placeholder="곡명 입력"
                  />
                  {/* 에러 표시 */}
                  {firstPageForm.formState.errors.songName && (
                    <div className="text-destructive">
                      {firstPageForm.formState.errors.songName.message}
                    </div>
                  )}

                  {/* 신입고정 여부 */}
                  <div className="flex items-center gap-x-2">
                    <Checkbox
                      id="isFreshmenFixedInput"
                      onCheckedChange={(e) =>
                        firstPageForm.setValue("isFreshmenFixed", !!e)
                      }
                      checked={firstPageForm.getValues("isFreshmenFixed")}
                    />
                    <Label
                      htmlFor="isFreshmenFixedInput"
                      className="text-sm text-gray-400"
                    >
                      신입고정팀입니다
                    </Label>
                  </div>
                </div>

                {/* 아티스트 입력 */}
                <div>
                  <Label htmlFor="songArtistInput" className="font-semibold">
                    아티스트명
                  </Label>
                  <Input
                    id="songArtistInput"
                    {...firstPageForm.register("songArtist")}
                    className={cn(
                      "my-1",
                      firstPageForm.formState.errors.songArtist &&
                        "border-destructive"
                    )}
                    placeholder="아티스트명 입력"
                  />
                  {/* 에러 표시 */}
                  {firstPageForm.formState.errors.songArtist && (
                    <div className="text-destructive">
                      {firstPageForm.formState.errors.songArtist.message}
                    </div>
                  )}

                  {/* 자작곡 여부 */}
                  <div className="flex items-center gap-x-2">
                    <Checkbox
                      id="isSelfMadeInput"
                      onCheckedChange={(e) =>
                        firstPageForm.setValue("isSelfMade", !!e)
                      }
                      checked={firstPageForm.getValues("isSelfMade")}
                    />
                    <Label
                      htmlFor="isSelfMadeInput"
                      className="text-sm text-gray-400"
                    >
                      자작곡입니다
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* 디바이더 */}
            <hr className="my-14" />

            {/* 세션 초기화 폼 */}
            <div>
              {/* 설명 */}
              <Description header="세션 정보" className="mb-6">
                <AiFillExclamationCircle />
                곡에 필요한 모든 세션을 체크해주세요
              </Description>

              {/* 세션 체크박스 */}
              <table className="table-auto">
                <tbody>
                  {Object.entries(memberSessionRequiredFormStructure).map(
                    ([label, fieldNames]) => (
                      <tr key={label} className="font-semibold">
                        <td className="w-52">{label}</td>
                        {fieldNames.map((fieldName) => (
                          <td key={`${label}-${fieldName}`} className="p-4">
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
            </div>

            {/* 페이지 이동 */}
            <Paginator
              onNext={firstPageForm.handleSubmit(
                onFirstPageValid,
                onFirstPageInvalid
              )}
              isFirstPage={true}
              totalPage={2}
              currentPage={1}
            />
          </form>
        </Form>
      )}
      {currentPage === 2 && (
        <SecondPage
          schemaMetadata={secondPageSchemaMetadata}
          onValid={onSecondPageValid}
          onInvalid={onSecondPageInvalid}
          onPreviousButtonClick={() => setCurrentPage(1)}
          firstPageForm={firstPageForm}
        />
      )}
    </div>
  )
}

export default TeamCreateForm
