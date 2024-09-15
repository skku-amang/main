"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { FaExclamationCircle } from "react-icons/fa"
import { GoDot, GoDotFill } from "react-icons/go"
import { z } from "zod"

import MemberSelect from "@/app/(general)/teams/create/_components/TeamCreateForm/MemberSelect"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import API_ENDPOINTS from "@/constants/apiEndpoints"
import fetchData from "@/lib/fetch"
import { cn } from "@/lib/utils"
import { Performance } from "@/types/Performance"
import { SessionName } from "@/types/Session"
import { User } from "@/types/User"

import CheckboxField from "./CheckboxField"
import teamCreateFormSchema, {
  basicInfoSchema,
  memberSessionSchema
} from "./schema"

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

  const basicInfoForm = useForm<z.infer<typeof basicInfoSchema>>({
    resolver: zodResolver(basicInfoSchema)
  })
  const memberSessionForm = useForm<z.infer<typeof memberSessionSchema>>({
    resolver: zodResolver(memberSessionSchema)
  })
  const teamCreateForm = useForm<z.infer<typeof teamCreateFormSchema>>({
    resolver: zodResolver(teamCreateFormSchema)
  })

  async function onValid(formData: z.infer<typeof teamCreateFormSchema>) {
    if (currentPage === 1) {
      // 첫 번째 페이지 검증
      const basicInfoResult = basicInfoSchema.safeParse(formData)
      if (!basicInfoResult.success) {
        // 오류 처리
        console.log(basicInfoResult.error)
        return
      }
      // 다음 페이지로 이동
      setCurrentPage(2)
    } else if (currentPage === 2) {
      // 두 번째 페이지 검증
      const memberSessionsResult = memberSessionSchema.safeParse(formData)
      if (!memberSessionsResult.success) {
        // 오류 처리
        console.log(memberSessionsResult.error)
        return
      }
      // 폼 제출
      console.log("폼 제출 성공:", formData)
    }
  }

  return (
    <div className="container flex h-auto w-full flex-col items-center">
      <div className="fixed z-[-1] h-64 w-screen bg-primary"></div>

      {/* 타이틀 */}
      <div className="z-10 mt-24 flex flex-col items-center">
        <h1 className="pb-6 text-3xl font-medium text-white sm:text-5xl">
          Create New Team
        </h1>
        <div className="h-[0.1rem] w-[15rem] bg-white sm:h-[0.15rem] sm:w-[25rem]"></div>
      </div>

      <div className="w-full rounded-lg bg-gray-50 px-20 py-10 shadow-xl">
        <Form {...teamCreateForm}>
          <form
            onSubmit={teamCreateForm.handleSubmit(onValid)}
            className="w-full"
          >
            {/* 1페이지 */}
            <div className={cn(currentPage !== 1 && "hidden", "w-full")}>
              {/* 기본 정보 */}
              <div className="flex flex-col items-center gap-11 border-b-[1px] border-b-zinc-200 pb-20 sm:w-full">
                <div className="flex w-full flex-col items-center gap-0">
                  <div className="w-full text-lg font-semibold text-slate-900">
                    공연 및 곡 정보
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <FaExclamationCircle />
                    <div className="text-sm font-medium text-gray-500">
                      입력 시 주의사항을 확인해주세요
                    </div>
                    {/* <div className="left-64 z-10 h-28 w-96 rounded-xl bg-zinc-800 p-2 opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100">
                      <div className="border-l-16 bg-gray h-0 w-0 rotate-90 transform border-b-8 border-t-8 border-b-transparent border-t-transparent bg-pink-400">
                        asdf
                      </div>
                    </div> */}
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 gap-x-10 gap-y-2">
                  {/* Field: 공연 선택 */}
                  <div className="col-span-1">
                    <Label htmlFor="performanceId">
                      공연선택<span className="text-destructive">&nbsp;*</span>
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        basicInfoForm.setValue("performanceId", +value, {
                          shouldValidate: true
                        })
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          basicInfoForm.formState.errors.performanceId &&
                            "border-destructive"
                        )}
                      >
                        <SelectValue placeholder="공연 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {performanceOptions.map((performance) => (
                            <SelectItem
                              key={performance.id}
                              value={performance.id.toString()}
                            >
                              {performance.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1"></div>

                  {/* Field: 곡명 */}
                  <div className="col-span-1">
                    <Label htmlFor="songName">
                      곡명<span className="text-destructive">&nbsp;*</span>
                    </Label>
                    <Input
                      className={cn(
                        "w-full",
                        basicInfoForm.formState.errors.songName &&
                          "border-destructive"
                      )}
                      {...basicInfoForm.register("songName")}
                    />
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox
                        id="isFreshmenFixed"
                        {...basicInfoForm.register("isFreshmenFixed")}
                      />
                      <Label htmlFor="isFreshmenFixed">신입고정곡입니다.</Label>
                    </div>
                  </div>

                  {/* Field: 아티스트명 */}
                  <div className="col-span-1">
                    <Label htmlFor="artist">
                      아티스트명
                      <span className="text-destructive">&nbsp;*</span>
                    </Label>
                    <Input
                      className={cn(
                        "w-full",
                        basicInfoForm.formState.errors.artistName &&
                          "border-destructive"
                      )}
                      {...basicInfoForm.register("artistName")}
                    />
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox
                        id="isSelfMade"
                        {...basicInfoForm.register("isSelfMade")}
                      />
                      <Label htmlFor="isSelfMade">자작곡입니다.</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 세션 정보 */}
              <div className="flex flex-col items-start justify-start pt-20">
                <div className="flex w-full flex-col gap-2 pb-10 sm:left-20 sm:top-20 sm:items-start">
                  <div className="text-lg font-semibold text-slate-900">
                    세션 정보
                  </div>
                  <div className="flex items-center gap-2">
                    <FaExclamationCircle />
                    <div className="text-sm font-medium text-gray-500">
                      곡에 필요한 모든 세션을 체크해주세요
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-8">
                  {/* 보컬 */}
                  <div>보컬</div>
                  <CheckboxField
                    form={memberSessionForm}
                    memberSessionFieldName="memberSessions.보컬1.required"
                    label="보컬1"
                  />
                  <CheckboxField
                    form={memberSessionForm}
                    memberSessionFieldName="memberSessions.보컬2.required"
                    label="보컬2"
                  />
                  <CheckboxField
                    form={memberSessionForm}
                    memberSessionFieldName="memberSessions.보컬3.required"
                    label="보컬3"
                  />

                  {/* 기타 */}
                  <div>기타</div>
                  <CheckboxField
                    form={memberSessionForm}
                    memberSessionFieldName="memberSessions.기타1.required"
                    label="기타1"
                  />
                  <CheckboxField
                    form={memberSessionForm}
                    memberSessionFieldName="memberSessions.기타2.required"
                    label="기타2"
                  />
                  <CheckboxField
                    form={memberSessionForm}
                    memberSessionFieldName="memberSessions.기타3.required"
                    label="기타3"
                  />

                  {/* 베이스 및 드럼 */}
                  <div>베이스</div>
                  <CheckboxField
                    form={memberSessionForm}
                    memberSessionFieldName="memberSessions.베이스1.required"
                    label="베이스1"
                  />
                  <CheckboxField
                    form={memberSessionForm}
                    memberSessionFieldName="memberSessions.베이스2.required"
                    label="베이스2"
                  />
                  <CheckboxField
                    form={memberSessionForm}
                    memberSessionFieldName="memberSessions.드럼.required"
                    label="드럼"
                  />

                  {/* 신디 */}
                  <div>신디</div>
                  <CheckboxField
                    form={memberSessionForm}
                    memberSessionFieldName="memberSessions.신디1.required"
                    label="신디1"
                  />
                  <CheckboxField
                    form={memberSessionForm}
                    memberSessionFieldName="memberSessions.신디2.required"
                    label="신디2"
                  />
                  <div></div>

                  {/* 그 외 */}
                  <div>그 외</div>
                  <CheckboxField
                    form={memberSessionForm}
                    memberSessionFieldName="memberSessions.현악기.required"
                    label="현악기"
                  />
                  <CheckboxField
                    form={memberSessionForm}
                    memberSessionFieldName="memberSessions.관악기.required"
                    label="관악기"
                  />
                </div>
              </div>
            </div>

            {/* 2페이지 */}
            <div className={cn(currentPage !== 2 && "hidden", "p-10")}>
              {/* 팀원 정보 */}
              <div className="flex w-full flex-col justify-center border-b-[1px] border-b-zinc-200 pb-20">
                <div className="mb-2 text-lg font-semibold text-slate-900">
                  팀원 정보
                </div>
                <div className="flex items-center gap-2">
                  <FaExclamationCircle />
                  <p className="text-sm font-medium text-gray-500">
                    이미 멤버가 확정된 세션의 경우, 해당 세션에 체크표시 후
                    멤버를 선택해주세요.
                    <br />
                    멤버모집이 필요한 세션의 경우, 체크표시가 되어 있지 않아야
                    합니다
                  </p>
                </div>

                <div className="mt-5 space-y-5">
                  {memberSessionForm.getValues().memberSessions &&
                    Object.keys(memberSessionForm.getValues().memberSessions)
                      .toSorted()
                      .map((key) => {
                        return (
                          <MemberSelect
                            key={key}
                            form={memberSessionForm}
                            memberSessionFieldName={key}
                            users={users}
                          />
                        )
                      })}
                </div>
              </div>

              {/* 소개글 작성 */}
              <div className="pt-20">
                <div className="text-lg font-semibold text-slate-900">
                  게시글 작성
                </div>
                <div className="flex items-center gap-2">
                  <FaExclamationCircle />
                  <p className="text-sm font-medium text-gray-500">
                    자유롭게 팀을 홍보해주세요
                  </p>
                </div>
                <Textarea
                  {...basicInfoForm.register("description")}
                  className="mt-5"
                />
              </div>
            </div>

            {/* 페이지 이동 */}
            <div className="mt-20 flex w-full items-center justify-around">
              <Button
                variant={currentPage === 1 ? "outline" : undefined}
                className="rounded-none"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
              >
                Back
              </Button>
              <div className="flex items-center gap-x-3">
                <div>
                  {currentPage === 1 ? (
                    <GoDotFill size={20} />
                  ) : (
                    <GoDot size={20} />
                  )}
                </div>
                <div>
                  {currentPage === 2 ? (
                    <GoDotFill size={20} />
                  ) : (
                    <GoDot size={20} />
                  )}
                </div>
              </div>
              <Button
                className="rounded-none"
                onClick={() => {
                  if (currentPage === 1) {
                    basicInfoForm.handleSubmit(
                      () => {
                        console.log("basicInfoForm")
                        setCurrentPage(2)
                      },
                      (formData) => console.log(formData)
                    )()
                  } else if (currentPage === 2) {
                    basicInfoForm.handleSubmit(
                      (basicInfoData) => {
                        memberSessionForm.handleSubmit(
                          (memberSessionsData) => {
                            let translatedMemberSessions: {
                              session: SessionName
                              members: (number | null)[]
                              requiredMemberCount: number
                            }[] = []
                            // 폼 데이터를 API 형식에 맞게 변환
                            const formMemberSessions = Object.values(
                              memberSessionsData.memberSessions
                            )
                            formMemberSessions.forEach((formMemberSession) => {
                              let targetTranslatedMemberSession =
                                translatedMemberSessions.find(
                                  (ms) =>
                                    ms.session === formMemberSession.sessionName
                                )
                              if (
                                targetTranslatedMemberSession &&
                                formMemberSession.memberId
                              ) {
                                targetTranslatedMemberSession.requiredMemberCount += 1
                                targetTranslatedMemberSession.members[
                                  formMemberSession.index - 1
                                ] = formMemberSession.memberId
                              } else {
                                if (!formMemberSession.memberId) return
                                translatedMemberSessions.push({
                                  session:
                                    formMemberSession.sessionName as SessionName,
                                  members: [formMemberSession.memberId],
                                  requiredMemberCount: 1
                                })
                              }
                            })

                            console.log(translatedMemberSessions)
                            // API 호출
                            const teamCreateData = {
                              ...basicInfoData,
                              memberSessions: translatedMemberSessions
                            }
                            fetchData(API_ENDPOINTS.TEAM.CREATE, {
                              body: JSON.stringify(teamCreateData)
                            }).then((data) => data.json())
                          },
                          (formData) => console.warn(formData)
                        )()
                      },
                      (formData) => console.warn(formData)
                    )()
                  }
                }}
              >
                Next
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default TeamCreateForm
