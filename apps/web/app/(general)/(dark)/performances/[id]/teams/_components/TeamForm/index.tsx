"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Team } from "@repo/shared-types"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { FieldErrors, useForm } from "react-hook-form"
import { z } from "zod"

import Loading from "@/app/_(errors)/Loading"
import { useToast } from "@/components/hooks/use-toast"
import ROUTES from "@/constants/routes"
import { useCreateTeam, useUpdateTeam } from "@/hooks/api/useTeam"
import { cn } from "@/lib/utils"

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

  const isCreate = !initialData?.id
  const {
    mutate: mutateTeamCreate,
    isError: isCreateError,
    data: createData
  } = useCreateTeam()
  const {
    mutate: mutateTeamUpdate,
    isError: isUpdateError,
    data: updateData
  } = useUpdateTeam(initialData?.id as number)
  const isError = isCreateError || isUpdateError
  const data = createData || updateData

  // First Page
  const firstPageForm = useForm<z.infer<typeof basicInfoSchema>>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      performanceId: initialData?.performance.id,
      songName: initialData?.songName,
      isFreshmenFixed: initialData?.isFreshmenFixed,
      songArtist: initialData?.songArtist,
      isSelfMade: initialData?.isSelfMade,
      description: initialData?.description || "",
      songYoutubeVideoUrl: initialData?.songYoutubeVideoUrl || ""
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
    const defaultValues: {
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
        const fieldKey = defaultValues[fieldName]
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
    const memberSessionData: { [key: string]: (number | null)[] } = {}
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

    const allFormData = {
      performanceId: firstPageForm.getValues("performanceId"),
      songName: firstPageForm.getValues("songName"),
      songArtist: firstPageForm.getValues("songArtist"),
      memberSessions,
      description: firstPageForm.getValues("description"),
      songYoutubeVideoUrl: firstPageForm.getValues("songYoutubeVideoUrl"),
      posterImage: firstPageForm.getValues("posterImage"),
      isFreshmenFixed: firstPageForm.getValues("isFreshmenFixed"),
      isSelfMade: firstPageForm.getValues("isSelfMade")
    }

    if (isCreate) {
      mutateTeamCreate({
        performanceId: allFormData.performanceId,
        teamData: allFormData
      })
    } else {
      mutateTeamUpdate(allFormData)
    }

    if (isError || !data) {
      toast({
        title: "오류",
        description: isCreate
          ? "팀 생성 중 오류가 발생했습니다."
          : "팀 수정 중 오류가 발생했습니다.",
        variant: "destructive"
      })
      return
    }
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
          onPrevious={
            initialData
              ? () =>
                  router.push(
                    ROUTES.PERFORMANCE.TEAM.DETAIL(
                      initialData.performance.id,
                      initialData.id
                    )
                  )
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
