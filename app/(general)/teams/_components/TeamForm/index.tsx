"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { StatusCodes } from "http-status-codes"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { FieldErrors, useForm } from "react-hook-form"
import { z } from "zod"

import Loading from "@/app/_(errors)/Loading"
import FirstPage from "@/app/(general)/teams/_components/TeamForm/FirstPage"
import basicInfoSchema from "@/app/(general)/teams/_components/TeamForm/FirstPage/schema"
import SecondPage from "@/app/(general)/teams/_components/TeamForm/SecondPage"
import { memberSessionRequiredBaseSchema } from "@/app/(general)/teams/_components/TeamForm/SecondPage/schema"
import ThirdPage from "@/app/(general)/teams/_components/TeamForm/ThirdPage"
import { useToast } from "@/components/hooks/use-toast"
import API_ENDPOINTS from "@/constants/apiEndpoints"
import ROUTES from "@/constants/routes"
import fetchData from "@/lib/fetch"
import { CreateRetrieveUpdateResponse } from "@/lib/fetch/responseBodyInterfaces"
import YoutubeVideo from "@/lib/youtube"
import { Team } from "@/types/Team"

interface TeamCreateFormProps {
  initialData?: z.infer<typeof basicInfoSchema>
}

const TeamForm = ({ initialData }: TeamCreateFormProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const session = useSession()
  const router = useRouter()
  const { toast } = useToast()

  // First Page
  const firstPageForm = useForm<z.infer<typeof basicInfoSchema>>({
    resolver: zodResolver(basicInfoSchema)
  })
  function onFirstPageValid(formData: z.infer<typeof basicInfoSchema>) {
    const firstPageResult = basicInfoSchema.safeParse(formData)
    if (!firstPageResult.success) {
      // console.log(firstPageResult.error)
      return
    }
    setCurrentPage(2)
  }
  function onFirstPageInvalid(
    errors: FieldErrors<z.infer<typeof basicInfoSchema>>
  ) {
    console.warn(errors)
  }

  // Second Page
  const secondPageForm = useForm<
    z.infer<typeof memberSessionRequiredBaseSchema>
  >({
    resolver: zodResolver(memberSessionRequiredBaseSchema),
    defaultValues: {
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
  function onSecondPageValid(
    formData: z.infer<typeof memberSessionRequiredBaseSchema>
  ) {
    console.log(formData)
    const result = memberSessionRequiredBaseSchema.safeParse(formData)
    if (!result.success) {
      // console.log(result.error)
      return
    }
    console.log(result.data)
    setThirdPageSchemaMetadata(result.data)
    setCurrentPage(3)
  }
  function onSecondPageInvalid(
    errors: FieldErrors<z.infer<typeof memberSessionRequiredBaseSchema>>
  ) {
    console.error(errors)
  }

  // Third Page
  const [thirdPageSchemaMetadata, setThirdPageSchemaMetadata] =
    useState<z.infer<any>>()
  async function onThirdPageValid(secondPageFormData: z.infer<any>) {
    const youtubeVideoId = firstPageForm.getValues("songYoutubeVideoId")
    let allFormData = {
      performanceId: firstPageForm.getValues("performanceId"),
      songName: firstPageForm.getValues("songName"),
      songArtist: firstPageForm.getValues("songArtist"),
      memberSessions: Object.values(secondPageFormData),
      description: firstPageForm.getValues("description"),
      songYoutubeVideoId:
        youtubeVideoId && YoutubeVideo.getValidVideoIdOrNull(youtubeVideoId),
      posterImage: firstPageForm.getValues("posterImage")
    }

    const res = await fetchData(API_ENDPOINTS.TEAM.CREATE, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${session.data?.access}`
      },
      body: JSON.stringify(allFormData)
    })
    if (!res.ok) {
      const data = await res.json()
      switch (res.status) {
        case StatusCodes.BAD_REQUEST:
          toast({
            title: res.statusText,
            description: data.detail,
            variant: "destructive"
          })
          break
        case StatusCodes.UNAUTHORIZED:
          toast({
            title: res.statusText,
            description: data.details,
            variant: "destructive"
          })
          break
        default:
          toast({
            title: res.statusText,
            description: data.detail,
            variant: "destructive"
          })
          break
      }
      return
    }
    const data = (await res.json()) as CreateRetrieveUpdateResponse<Team>
    router.push(ROUTES.TEAM.DETAIL(data.id).url)
  }
  function onThirdPageInvalid(errors: FieldErrors<z.infer<any>>) {
    console.warn("FormInvalid:", errors)
  }

  if (session.status === "loading") return <Loading />
  if (!session.data) router.push(ROUTES.HOME.url)

  return (
    <div className="m-20 rounded-2xl p-20 shadow-2xl">
      {currentPage === 1 && (
        <FirstPage
          form={firstPageForm}
          onValid={onFirstPageValid}
          onInvalid={onFirstPageInvalid}
          accessToken={session.data?.access}
        />
      )}
      {currentPage === 2 && (
        <SecondPage
          form={secondPageForm}
          onValid={onSecondPageValid}
          onInvalid={onSecondPageInvalid}
          onPrevious={() => setCurrentPage(1)}
        />
      )}
      {currentPage === 3 && (
        <ThirdPage
          schemaMetadata={thirdPageSchemaMetadata}
          onValid={onThirdPageValid}
          onInvalid={onThirdPageInvalid}
          onPrevious={() => setCurrentPage(2)}
          firstPageForm={firstPageForm}
        />
      )}
    </div>
  )
}

export default TeamForm
