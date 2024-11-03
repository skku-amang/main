import { CircleAlert } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import SimpleLabel from "@/components/Form/SimpleLabel"
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
import { Textarea } from "@/components/ui/textarea"
import API_ENDPOINTS from "@/constants/apiEndpoints"
import fetchData from "@/lib/fetch"
import { cn } from "@/lib/utils"
import { Performance } from "@/types/Performance"

import Description from "../Description"
import basicInfoSchema from "../FirstPage/schema"
import YoutubeDialog from "../FirstPage/YoutubeDialog"
import Paginator from "../Paginator"

interface FirstPageProps {
  form: ReturnType<typeof useForm<z.infer<typeof basicInfoSchema>>>
  // eslint-disable-next-line no-unused-vars
  onValid: (formData: z.infer<any>) => void
  // eslint-disable-next-line no-unused-vars
  onInvalid: (formData: z.infer<any>) => void
  accessToken?: string
  onPrevious?: () => void
}

const FirstPage = ({
  form,
  onValid,
  onInvalid,
  accessToken,
  onPrevious
}: FirstPageProps) => {
  const [performances, setPerformances] = useState<Performance[]>([])
  useEffect(() => {
    fetchData(API_ENDPOINTS.PERFORMANCE.LIST, {
      cache: "no-cache",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then((res) => res.json())
      .then((json) => setPerformances(json))
  }, [accessToken])

  return (
    <Form {...form}>
      <form>
        {/* 공연 및 곡 폼 */}
        <div>
          {/* 설명 */}
          <Description header="공연 및 곡 정보" className="mb-6">
            <CircleAlert />
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
              {/* TODO: 나머지 필드도 SimpleLabel으로 교체 + htmlFor 추가 */}
              <SimpleLabel required={true} htmlFor="performanceIdInput">
                공연 선택
              </SimpleLabel>
              <Select
                onValueChange={(e) => {
                  form.setValue("performanceId", +e)
                  form.clearErrors("performanceId")
                }}
                value={form.getValues("performanceId")?.toString()}
              >
                <SelectTrigger
                  id="performanceIdInput"
                  className={cn(
                    "mt-1",
                    form.formState.errors.performanceId && "border-destructive"
                  )}
                >
                  <SelectValue placeholder="공연 선택" />
                </SelectTrigger>
                <SelectContent>
                  {performances.length > 0 &&
                    performances.map((performance) => (
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
              {form.formState.errors.performanceId && (
                <div className="text-destructive">
                  {form.formState.errors.performanceId.message}
                </div>
              )}
            </div>
            <div></div>

            {/* 곡 입력 */}
            <div>
              <SimpleLabel
                required={true}
                htmlFor="songNameInput"
                className="font-semibold"
              >
                곡명
              </SimpleLabel>
              <Input
                id="songNameInput"
                {...form.register("songName")}
                className={cn(
                  "my-1",
                  form.formState.errors.songName && "border-destructive"
                )}
                placeholder="곡명 입력"
              />
              {/* 에러 표시 */}
              {form.formState.errors.songName && (
                <div className="text-destructive">
                  {form.formState.errors.songName.message}
                </div>
              )}

              {/* 신입고정 여부 */}
              <div className="flex items-center gap-x-2">
                <Checkbox
                  id="isFreshmenFixedInput"
                  onCheckedChange={(e) => form.setValue("isFreshmenFixed", !!e)}
                  checked={form.getValues("isFreshmenFixed")}
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
              <SimpleLabel
                required={true}
                htmlFor="songArtistInput"
                className="font-semibold"
              >
                아티스트명
              </SimpleLabel>
              <Input
                id="songArtistInput"
                {...form.register("songArtist")}
                className={cn(
                  "my-1",
                  form.formState.errors.songArtist && "border-destructive"
                )}
                placeholder="아티스트명 입력"
              />
              {/* 에러 표시 */}
              {form.formState.errors.songArtist && (
                <div className="text-destructive">
                  {form.formState.errors.songArtist.message}
                </div>
              )}

              {/* 자작곡 여부 */}
              <div className="flex items-center gap-x-2">
                <Checkbox
                  id="isSelfMadeInput"
                  onCheckedChange={(e) => form.setValue("isSelfMade", !!e)}
                  checked={form.getValues("isSelfMade")}
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

        {/* 게시글, 유튜브 링크 */}
        <div>
          <Description
            header={
              <SimpleLabel htmlFor="descriptionInput">게시글 작성</SimpleLabel>
            }
            className="mb-6"
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center justify-between gap-x-2">
                <CircleAlert />
                자유롭게 팀을 홍보해주세요
              </div>

              {/* 유튜브 링크 팝업 */}
              <div>
                <YoutubeDialog form={form} fieldName="songYoutubeVideoId" />
                {form.formState.errors.songYoutubeVideoId && (
                  <div className="mt-1 text-end text-xs text-destructive">
                    {form.formState.errors.songYoutubeVideoId.message}
                  </div>
                )}
              </div>
            </div>
          </Description>
          <Textarea
            id="descriptionInput"
            rows={7}
            placeholder="팀 홍보 글을 작성해주세요"
            {...form.register("description")}
          />
          {/* 에러 표시 */}
          {form.formState.errors.description && (
            <div className="text-destructive">
              {form.formState.errors.description.message}
            </div>
          )}
        </div>

        {/* 페이지 이동 */}
        <Paginator
          onNext={form.handleSubmit(onValid, onInvalid)}
          totalPage={3}
          currentPage={1}
          onPrevious={onPrevious}
        />
      </form>
    </Form>
  )
}

export default FirstPage
