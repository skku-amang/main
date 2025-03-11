import { zodResolver } from "@hookform/resolvers/zod"
import { CircleAlert, Youtube } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import YoutubeSubmitButton from "@/app/(general)/(light)/performances/[id]/teams/_components/TeamForm/FirstPage/YoutubeSubmitButton"
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
import YoutubeVideo from "@/lib/youtube"
import YoutubePlayer from "@/lib/youtube/Player"
import { Performance } from "@/types/Performance"

import Description from "../Description"
import Paginator from "../Paginator"
import basicInfoSchema, { songYoutubeVideoIdSchema } from "./schema"
import YoutubeDialog from "./YoutubeDialog"

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

  // 유튜브 URL 로직
  const youtubeSchema = z.object({
    songYoutubeVideoId: songYoutubeVideoIdSchema
  })
  const youtubeForm = useForm<z.infer<typeof youtubeSchema>>({
    resolver: zodResolver(youtubeSchema),
    defaultValues: {
      songYoutubeVideoId: YoutubeVideo.getURL(
        form.getValues("songYoutubeVideoId") as string
      )
    }
  })

  function onInnerFormValid(formData: any) {
    form.clearErrors("songYoutubeVideoId")
    form.setValue("songYoutubeVideoId", formData.songYoutubeVideoId)
  }

  return (
    <div>
      <Form {...form}>
        <form>
          {/* 공연 및 곡 폼 */}
          <div>
            {/* 설명 */}
            <Description header="공연 및 곡 정보" className="mb-4 md:mb-6">
              <CircleAlert className="h-2.5 w-2.5 text-gray-600 md:h-4 md:w-4" />
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

            <div className="grid gap-x-14 gap-y-4 md:grid-cols-2 md:gap-y-6">
              {/* 공연 선택 */}
              <div className="space-y-2 md:space-y-1.5">
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
                      "mt-1 drop-shadow-search",
                      form.formState.errors.performanceId &&
                        "border-destructive"
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
              <div className="hidden md:block"></div>

              {/* 곡 입력 */}
              <div className="space-y-2 md:space-y-1.5">
                <SimpleLabel required={true} htmlFor="songNameInput">
                  곡명
                </SimpleLabel>
                <Input
                  id="songNameInput"
                  {...form.register("songName")}
                  className={cn(
                    "my-1 drop-shadow-search",
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
                    onCheckedChange={(e) =>
                      form.setValue("isFreshmenFixed", !!e)
                    }
                    checked={form.getValues("isFreshmenFixed")}
                    className="h-4 w-4 rounded-md border border-gray-400"
                  />
                  <Label
                    htmlFor="isFreshmenFixedInput"
                    className="text-xs text-neutral-500"
                  >
                    신입고정팀입니다
                  </Label>
                </div>
              </div>

              {/* 아티스트 입력 */}
              <div className="space-y-2 md:space-y-1.5">
                <SimpleLabel required={true} htmlFor="songArtistInput">
                  아티스트명
                </SimpleLabel>
                <Input
                  id="songArtistInput"
                  {...form.register("songArtist")}
                  className={cn(
                    "my-1 drop-shadow-search",
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
                    className="h-4 w-4 rounded-md border border-gray-400"
                  />
                  <Label
                    htmlFor="isSelfMadeInput"
                    className="text-xs text-neutral-500 md:text-sm"
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
            <Description header="게시글 작성" className="mb-4">
              <div className="flex w-full flex-col items-start justify-between md:flex-row">
                <div className="flex items-center justify-between gap-x-2">
                  <CircleAlert className="h-2.5 w-2.5 text-gray-600 md:h-4 md:w-4" />
                  자유롭게 팀을 홍보해주세요(유튜브 링크 첨부 필수)
                </div>

                {/* 유튜브 링크 데스크톱: 다이얼로그 */}
                <div className="hidden md:block">
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
        </form>
      </Form>

      {/* 유튜브 링크 모바일: 블록 */}
      <div className="mt-3 w-full space-y-2 rounded-lg bg-slate-100 p-3 drop-shadow-search md:hidden">
        <div className="flex items-center gap-x-2">
          <Youtube size={24} strokeWidth={0.85} />
          <div>
            <div className="text-md text-gray-600">Youtube Embed</div>
            <div className="text-xs text-gray-400">
              유튜브 링크를 첨부하여 주세요
            </div>
          </div>
        </div>

        {/* TODO: 기존 값 그대로 사용하려고 할 때 에러 발생하는 버그 수정 필요 */}
        <Form {...youtubeForm}>
          <form
            onSubmit={youtubeForm.handleSubmit(onInnerFormValid, (e) =>
              console.log(e)
            )}
          >
            <div className="flex items-center justify-between gap-x-2">
              {/* 입력 필드 */}
              <Input
                placeholder="Enter URL"
                {...youtubeForm.register("songYoutubeVideoId")}
                className={
                  form.formState.errors.songYoutubeVideoId &&
                  "border-destructive"
                }
                onChange={(e) => {
                  youtubeForm.clearErrors("songYoutubeVideoId")
                  youtubeForm.reset(
                    {
                      ...youtubeForm.getValues(),
                      songYoutubeVideoId: e.target.value
                    },
                    {
                      keepErrors: true, // 기존 에러 상태를 유지합니다.
                      keepDirty: true, // 기존 dirty 상태를 유지합니다.
                      keepTouched: true, // 기존 touched 상태를 유지합니다.
                      keepIsSubmitted: false, // 제출 상태를 초기화합니다.
                      keepSubmitCount: false // 제출 횟수를 초기화합니다.
                    }
                  )
                }}
              />

              {/* 업로드 버튼 */}
              <YoutubeSubmitButton
                error={youtubeForm.formState.errors.songYoutubeVideoId}
                isSubmitted={youtubeForm.formState.isSubmitted}
              />
            </div>

            {/* 유튜브 플레이어 */}
            {youtubeForm.getValues("songYoutubeVideoId") && (
              <YoutubePlayer
                videoId={youtubeForm.getValues("songYoutubeVideoId")}
                className="mt-3 w-full"
              />
            )}

            {/* 에러 메시지 */}
            {youtubeForm.formState.errors.songYoutubeVideoId && (
              <div className="mt-1 text-xs text-destructive">
                {youtubeForm.formState.errors.songYoutubeVideoId.message}
              </div>
            )}
          </form>
        </Form>
      </div>

      {/* TODO: 모바일 이미지 업로드 추가 */}

      {/* 페이지 이동 */}
      <Paginator
        onNext={form.handleSubmit(onValid, onInvalid)}
        totalPage={3}
        currentPage={1}
        onPrevious={onPrevious}
        className="mt-8 md:mt-24"
      />
    </div>
  )
}

export default FirstPage
