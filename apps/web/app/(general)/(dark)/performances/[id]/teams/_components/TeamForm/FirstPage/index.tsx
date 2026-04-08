import {
  Check,
  CircleAlert,
  CloudUpload,
  RotateCw,
  Trash2,
  Youtube
} from "lucide-react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { z } from "zod"

import PosterImageDialog from "@/app/(general)/(dark)/performances/[id]/teams/_components/TeamForm/FirstPage/PosterImageDialog"
import YoutubeDialog from "@/app/(general)/(dark)/performances/[id]/teams/_components/TeamForm/FirstPage/YoutubeDialog"
import YoutubeInput from "@/app/(general)/(dark)/performances/[id]/teams/_components/TeamForm/FirstPage/YoutubeInput"
import SimpleLabel from "@/components/Form/SimpleLabel"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form } from "@/components/ui/form"
import {
  HoverCard,
  HoverCardArrow,
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
import { cn } from "@/lib/utils"
import { usePerformances } from "@/hooks/api/usePerformance"
import { useImageUpload } from "@/hooks/useImageUpload"
import { ACCEPTED_IMAGE_TYPES } from "@repo/shared-types"
import Description from "../Description"
import Paginator from "../Paginator"
import basicInfoSchema from "./schema"

interface FirstPageProps {
  form: ReturnType<typeof useForm<z.infer<typeof basicInfoSchema>>>

  onValid: (formData: z.infer<any>) => void

  onInvalid: (formData: z.infer<any>) => void
  onPrevious?: () => void
}

const FirstPage = ({
  form,
  onValid,
  onInvalid,
  onPrevious
}: FirstPageProps) => {
  const { data: performances } = usePerformances()

  function handleYoutubeConfirm(url: string) {
    form.clearErrors("songYoutubeVideoUrl")
    form.setValue("songYoutubeVideoUrl", url)
  }

  // 모바일 포스터 이미지 업로드
  const poster = useImageUpload({
    onSuccess: (publicUrl) => form.setValue("posterImage", publicUrl)
  })

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
                  <HoverCardArrow className="fill-black" />
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
                        "border-destructive focus-visible:ring-destructive"
                    )}
                  >
                    <SelectValue placeholder="공연 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {performances &&
                      performances.length > 0 &&
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
                    form.formState.errors.songName &&
                      "border-destructive focus-visible:ring-destructive"
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
                    checked={form.watch("isFreshmenFixed")}
                    className="h-4 w-4 rounded-md border border-gray-400"
                  />
                  <Label
                    htmlFor="isFreshmenFixedInput"
                    className="text-sm font-medium text-neutral-500"
                  >
                    신입고정곡입니다
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
                    form.formState.errors.songArtist &&
                      "border-destructive focus-visible:ring-destructive"
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
                    checked={form.watch("isSelfMade")}
                    className="h-4 w-4 rounded-md border border-gray-400"
                  />
                  <Label
                    htmlFor="isSelfMadeInput"
                    className="text-sm font-medium text-neutral-500"
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
                  자유롭게 팀을 홍보해주세요(유튜브 링크 첨부 선택)
                </div>

                {/* 데스크톱: 포스터 이미지 + 유튜브 다이얼로그 */}
                <div className="hidden md:block">
                  <div className="flex items-center gap-x-2">
                    <YoutubeDialog
                      form={form}
                      fieldName="songYoutubeVideoUrl"
                    />
                    <PosterImageDialog form={form} />
                  </div>
                  {form.formState.errors.songYoutubeVideoUrl && (
                    <div className="mt-1 text-end text-xs text-destructive">
                      {form.formState.errors.songYoutubeVideoUrl.message}
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

        <YoutubeInput
          defaultUrl={(form.getValues("songYoutubeVideoUrl") as string) || ""}
          onConfirm={handleYoutubeConfirm}
        />
      </div>

      {/* 포스터 이미지 모바일: 블록 */}
      <div className="mt-3 w-full space-y-2 rounded-lg bg-slate-100 p-3 drop-shadow-search md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <CloudUpload
              size={24}
              strokeWidth={0.85}
              className="text-gray-500"
            />
            <div>
              <div className="text-md text-gray-600">Image Upload</div>
              {poster.error ? (
                <span className="text-xs font-medium text-destructive">
                  Failed
                </span>
              ) : poster.isUploaded ? (
                <span className="flex items-center gap-x-1 text-xs font-medium text-emerald-600">
                  <Check size={12} strokeWidth={3} />
                  Completed
                </span>
              ) : (
                <div className="text-xs text-gray-400">
                  홍보포스터를 업로드하여 주세요
                </div>
              )}
            </div>
          </div>

          {poster.error ? (
            <div className="flex items-center gap-x-2">
              <button
                type="button"
                onClick={() => {
                  poster.reset()
                  form.setValue("posterImage", "")
                }}
              >
                <Trash2 size={18} className="text-gray-400" />
              </button>
              <button type="button" onClick={poster.upload}>
                <RotateCw size={18} className="text-gray-400" />
              </button>
            </div>
          ) : poster.isUploading ? (
            <Button
              type="button"
              disabled
              className="bg-gray-300 text-sm text-white"
            >
              Uploading...
            </Button>
          ) : poster.isUploaded ? (
            <button
              type="button"
              onClick={() => {
                poster.reset()
                form.setValue("posterImage", "")
              }}
            >
              <Trash2 size={18} className="text-gray-400" />
            </button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="border border-secondary text-sm text-secondary"
              onClick={() => {
                if (poster.inputRef.current) poster.inputRef.current.value = ""
                poster.inputRef.current?.click()
              }}
            >
              Upload
            </Button>
          )}
        </div>

        {/* Progress bar */}
        {poster.isUploading && (
          <div className="flex items-center gap-x-2">
            <div className="h-1.5 flex-1 rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${poster.progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{poster.progress}%</span>
            <button type="button" onClick={poster.cancelUpload}>
              <Trash2 size={14} className="text-gray-400" />
            </button>
          </div>
        )}

        {/* 미리보기 */}
        {!poster.isUploading &&
          (poster.preview || form.getValues("posterImage")) && (
            <div className="relative mt-2 aspect-[3/4] w-full overflow-hidden rounded-lg">
              <Image
                src={poster.preview || form.getValues("posterImage") || ""}
                alt="포스터 미리보기"
                fill
                className="object-cover"
              />
            </div>
          )}

        <input
          ref={poster.inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          onChange={poster.selectAndUpload}
          className="hidden"
        />
      </div>

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
