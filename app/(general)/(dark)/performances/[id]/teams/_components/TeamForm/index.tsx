"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { StatusCodes } from "http-status-codes"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { FieldErrors, useForm } from "react-hook-form"
import { z } from "zod"

import Loading from "@/app/_(errors)/Loading"
import { useToast } from "@/components/hooks/use-toast"
import API_ENDPOINTS, { ApiEndpoint } from "@/constants/apiEndpoints"
import ROUTES from "@/constants/routes"
import fetchData from "@/lib/fetch"
import { CreateRetrieveUpdateResponse } from "@/lib/fetch/responseBodyInterfaces"
import { cn } from "@/lib/utils"
import { Team } from "@/types/Team"

import FirstPage from "./FirstPage"
import basicInfoSchema from "./FirstPage/schema"
import SecondPage from "./SecondPage"
import {
  memberSessionRequiredBaseSchema,
  memberSessionRequiredField
} from "./SecondPage/schema"
import ThirdPage from "./ThirdPage"

interface TeamCreateFormProps {
  initialData?: Team
  className?: string
}

const TeamForm = ({ initialData, className }: TeamCreateFormProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const session = useSession()
  const router = useRouter()
  const { toast } = useToast()

  // First Page
  const firstPageForm = useForm<z.infer<typeof basicInfoSchema>>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      performanceId: initialData?.performance.id,
      songName: initialData?.songName,
      isFreshmenFixed: initialData?.isFreshmenFixed,
      songArtist: initialData?.songArtist,
      isSelfMade: initialData?.isSelfMade,
      description: initialData?.description,
      songYoutubeVideoId: initialData?.songYoutubeVideoId
    }
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
  function constructDefaultValues(initialData?: Team) {
    let defaultValues: {
      [key: string]: z.infer<ReturnType<typeof memberSessionRequiredField>>
    } = {
      보컬1: {
        session: "보컬",
        required: false,
        member: null,
        index: 1
      },
      보컬2: {
        session: "보컬",
        required: false,
        member: null,
        index: 2
      },
      보컬3: {
        session: "보컬",
        required: false,
        member: null,
        index: 3
      },
      기타1: {
        session: "기타",
        required: false,
        member: null,
        index: 1
      },
      기타2: {
        session: "기타",
        required: false,
        member: null,
        index: 2
      },
      기타3: {
        session: "기타",
        required: false,
        member: null,
        index: 3
      },
      베이스1: {
        session: "베이스",
        required: false,
        member: null,
        index: 1
      },
      베이스2: {
        session: "베이스",
        required: false,
        member: null,
        index: 2
      },
      드럼1: {
        session: "드럼",
        required: false,
        member: null,
        index: 1
      },
      신디1: {
        session: "신디",
        required: false,
        member: null,
        index: 1
      },
      신디2: {
        session: "신디",
        required: false,
        member: null,
        index: 2
      },
      신디3: {
        session: "신디",
        required: false,
        member: null,
        index: 3
      },
      현악기1: {
        session: "현악기",
        required: false,
        member: null,
        index: 1
      },
      관악기1: {
        session: "관악기",
        required: false,
        member: null,
        index: 1
      }
    }

    // Create: 디폴트 값 없음
    if (!initialData) return defaultValues

    // Edit: 디폴트 값 존재
    initialData.memberSessions?.forEach((ms) => {
      ms.members.forEach((member, index) => {
        const fieldName = `${ms.session}${index + 1}` as keyof z.infer<
          typeof memberSessionRequiredBaseSchema
        >
        let fieldKey = defaultValues[fieldName]
        if (!fieldKey) return
        fieldKey.required = true
        if (member) {
          fieldKey.member = member.id
        }
      })
    })
    return defaultValues
  }
  const secondPageForm = useForm<
    z.infer<typeof memberSessionRequiredBaseSchema>
  >({
    resolver: zodResolver(memberSessionRequiredBaseSchema),
    defaultValues: constructDefaultValues(initialData)
  })
  function onSecondPageValid(
    formData: z.infer<typeof memberSessionRequiredBaseSchema>
  ) {
    const result = memberSessionRequiredBaseSchema.safeParse(formData)
    if (!result.success) {
      // console.log(result.error)
      return
    }
    setCurrentPage(3)
  }
  function onSecondPageInvalid(
    errors: FieldErrors<z.infer<typeof memberSessionRequiredBaseSchema>>
  ) {
    console.error(errors)
  }

  // Third Page
  async function onThirdPageValid(
    secondPageFormData: z.infer<typeof memberSessionRequiredBaseSchema>
  ) {
    let memberSessionData: { [key: string]: (number | null)[] } = {}
    Object.values(secondPageFormData).map((ms) => {
      if (!ms.required) return
      if (!(ms.session in memberSessionData)) {
        memberSessionData[ms.session] = []
      }
      memberSessionData[ms.session][ms.index - 1] = ms.member
    })
    const memberSessions = Object.entries(memberSessionData).map(
      ([session, membersId]) => ({ session, membersId })
    )

    let allFormData = {
      performanceId: firstPageForm.getValues("performanceId"),
      songName: firstPageForm.getValues("songName"),
      songArtist: firstPageForm.getValues("songArtist"),
      memberSessions,
      description: firstPageForm.getValues("description"),
      songYoutubeVideoId: firstPageForm.getValues("songYoutubeVideoId"),
      posterImage: firstPageForm.getValues("posterImage"),
      isFreshmenFixed: firstPageForm.getValues("isFreshmenFixed"),
      isSelfMade: firstPageForm.getValues("isSelfMade")
    }

    const endpoint = initialData?.id
      ? API_ENDPOINTS.TEAM.UPDATE(initialData.id)
      : API_ENDPOINTS.TEAM.CREATE
    const res = await fetchData(endpoint as ApiEndpoint, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
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
    router.push(ROUTES.PERFORMANCE.TEAM.DETAIL(data.performance.id, data.id))
  }
  function onThirdPageInvalid(errors: FieldErrors<z.infer<any>>) {
    console.warn("FormInvalid:", errors)
  }

  if (session.status === "loading") return <Loading />
  if (!session.data) router.push(ROUTES.HOME)

  return (
    <div className={cn(`mb-20 rounded-2xl shadow-2xl`, className)}>
      {currentPage === 1 && (
        <FirstPage
          form={firstPageForm}
          onValid={onFirstPageValid}
          onInvalid={onFirstPageInvalid}
          accessToken={session.data?.access}
          onPrevious={
            initialData
              ? () => router.push(ROUTES.PERFORMANCE.TEAM.DETAIL(initialData.performance.id, initialData.id))
              : undefined
          }
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
          form={secondPageForm}
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
