"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FieldErrors, useForm } from "react-hook-form"
import { z } from "zod"

import Loading from "@/app/_(errors)/Loading"
import { useToast } from "@/components/hooks/use-toast"
import ROUTES from "@/constants/routes"
import { cn, getSessionIdBySessionName } from "@/lib/utils"
import { CreateTeam, TeamDetail, UpdateTeam } from "@repo/shared-types"

import { useSessions } from "@/hooks/api/useSession"
import { useCreateTeam, useUpdateTeam } from "@/hooks/api/useTeam"
import { SESSION_NAMES } from "@/constants/session"
import { useQueryClient } from "@tanstack/react-query"
import FirstPage from "./FirstPage"
import basicInfoSchema from "./FirstPage/schema"
import SecondPage from "./SecondPage"
import {
  memberSessionRequiredBaseSchema,
  memberSessionRequiredField
} from "./SecondPage/schema"
import ThirdPage from "./ThirdPage"

interface TeamCreateFormProps {
  initialData?: TeamDetail
  className?: string
}

const TeamForm = ({ initialData, className }: TeamCreateFormProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const session = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const { data: sessions } = useSessions()
  const queryClient = useQueryClient()

  const isCreate = !initialData?.id

  const { mutateAsync: mutateTeamCreate } = useCreateTeam()
  const { mutateAsync: mutateTeamUpdate } = useUpdateTeam()

  // First Page
  const firstPageForm = useForm<z.infer<typeof basicInfoSchema>>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      performanceId: initialData?.performanceId,
      songName: initialData?.songName,
      isFreshmenFixed: initialData?.isFreshmenFixed,
      songArtist: initialData?.songArtist,
      isSelfMade: initialData?.isSelfMade,
      description: initialData?.description || "",
      songYoutubeVideoUrl: initialData?.songYoutubeVideoUrl || "",
      posterImage: initialData?.posterImage || ""
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
  function constructDefaultValues(initialData?: TeamDetail) {
    const defaultValues: {
      [key: string]: z.infer<ReturnType<typeof memberSessionRequiredField>>
    } = {
      보컬1: {
        session: SESSION_NAMES.VOCAL,
        required: false,
        member: null,
        index: 1
      },
      보컬2: {
        session: SESSION_NAMES.VOCAL,
        required: false,
        member: null,
        index: 2
      },
      보컬3: {
        session: SESSION_NAMES.VOCAL,
        required: false,
        member: null,
        index: 3
      },
      기타1: {
        session: SESSION_NAMES.GUITAR,
        required: false,
        member: null,
        index: 1
      },
      기타2: {
        session: SESSION_NAMES.GUITAR,
        required: false,
        member: null,
        index: 2
      },
      기타3: {
        session: SESSION_NAMES.GUITAR,
        required: false,
        member: null,
        index: 3
      },
      베이스1: {
        session: SESSION_NAMES.BASS,
        required: false,
        member: null,
        index: 1
      },
      베이스2: {
        session: SESSION_NAMES.BASS,
        required: false,
        member: null,
        index: 2
      },
      드럼1: {
        session: SESSION_NAMES.DRUM,
        required: false,
        member: null,
        index: 1
      },
      신디1: {
        session: SESSION_NAMES.SYNTH,
        required: false,
        member: null,
        index: 1
      },
      신디2: {
        session: SESSION_NAMES.SYNTH,
        required: false,
        member: null,
        index: 2
      },
      신디3: {
        session: SESSION_NAMES.SYNTH,
        required: false,
        member: null,
        index: 3
      },
      현악기1: {
        session: SESSION_NAMES.STRINGS,
        required: false,
        member: null,
        index: 1
      },
      관악기1: {
        session: SESSION_NAMES.WINDS,
        required: false,
        member: null,
        index: 1
      }
    }

    // Create: 디폴트 값 없음
    if (!initialData) return defaultValues

    // Edit: 디폴트 값 존재 (teamSessions 사용)
    // defaultValues의 session, index를 기준으로 매칭
    initialData.teamSessions?.forEach((ts) => {
      // capacity만큼의 모든 슬롯을 required로 설정
      for (let i = 1; i <= ts.capacity; i++) {
        const entry = Object.entries(defaultValues).find(
          ([, value]) => value.session === ts.session.name && value.index === i
        )
        if (entry) {
          entry[1].required = true
        }
      }

      // 멤버가 있는 슬롯에는 멤버 정보 설정
      ts.members.forEach((member) => {
        const entry = Object.entries(defaultValues).find(
          ([, value]) =>
            value.session === ts.session.name && value.index === member.index
        )
        if (entry && member.user) {
          entry[1].member = member.user.id
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

  // initialData가 나중에 로드될 때 폼 값 업데이트
  useEffect(() => {
    if (initialData) {
      firstPageForm.reset({
        performanceId: initialData.performanceId,
        songName: initialData.songName,
        isFreshmenFixed: initialData.isFreshmenFixed,
        songArtist: initialData.songArtist,
        isSelfMade: initialData.isSelfMade,
        description: initialData.description || "",
        songYoutubeVideoUrl: initialData.songYoutubeVideoUrl || "",
        posterImage: initialData.posterImage || ""
      })
      secondPageForm.reset(constructDefaultValues(initialData))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData])

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
    // 세션 이름별로 멤버들을 그룹화
    const memberSessionData: {
      [sessionName: string]: { userId: number; index: number }[]
    } = {}

    Object.values(secondPageFormData).forEach((ms) => {
      if (!ms.required) return
      if (!(ms.session in memberSessionData)) {
        memberSessionData[ms.session] = []
      }
      if (ms.member !== null) {
        memberSessionData[ms.session]!.push({
          userId: ms.member,
          index: ms.index
        })
      }
    })

    // 서버에서 세션 목록 가져왔는지 확인
    if (!sessions) {
      toast({
        title: "오류",
        description:
          "세션 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive"
      })
      return
    }

    // CreateTeam/UpdateTeam 형식으로 변환
    const memberSessions: CreateTeam["memberSessions"] = Object.entries(
      memberSessionData
    ).map(([sessionName, members]) => {
      if (!sessionName) {
        throw new Error(`세션을 찾을 수 없습니다: ${sessionName}`)
      }
      // capacity는 해당 세션의 멤버 수 (required로 표시된 슬롯 수)
      const capacity = Object.values(secondPageFormData).filter(
        (ms) => ms.session === sessionName && ms.required
      ).length
      return {
        sessionId: getSessionIdBySessionName(sessionName, sessions),
        capacity,
        members
      }
    })

    const userId = session?.data?.user?.id
    if (!userId) {
      toast({
        title: "오류",
        description: "로그인이 필요합니다.",
        variant: "destructive"
      })
      return
    }

    if (isCreate) {
      const createData: CreateTeam = {
        name: firstPageForm.getValues("songName"),
        leaderId: Number(userId),
        performanceId: firstPageForm.getValues("performanceId"),
        songName: firstPageForm.getValues("songName"),
        songArtist: firstPageForm.getValues("songArtist"),
        memberSessions,
        description: firstPageForm.getValues("description") || null,
        songYoutubeVideoUrl:
          firstPageForm.getValues("songYoutubeVideoUrl") || null,
        posterImage: firstPageForm.getValues("posterImage") || null,
        isFreshmenFixed: firstPageForm.getValues("isFreshmenFixed") ?? false,
        isSelfMade: firstPageForm.getValues("isSelfMade") ?? false
      }
      try {
        const data = await mutateTeamCreate([createData])
        await queryClient.invalidateQueries({
          queryKey: ["teams", "performance"],
          refetchType: "all"
        })
        router.push(ROUTES.PERFORMANCE.TEAM.DETAIL(data.performanceId, data.id))
      } catch {
        toast({
          title: "오류",
          description: "팀 생성 중 오류가 발생했습니다.",
          variant: "destructive"
        })
      }
    } else {
      const updateData: UpdateTeam = {
        name: initialData.name,
        leaderId: initialData.leaderId,
        songName: firstPageForm.getValues("songName"),
        songArtist: firstPageForm.getValues("songArtist"),
        memberSessions,
        description: firstPageForm.getValues("description") || null,
        songYoutubeVideoUrl:
          firstPageForm.getValues("songYoutubeVideoUrl") || null,
        posterImage: firstPageForm.getValues("posterImage") || null,
        isFreshmenFixed: firstPageForm.getValues("isFreshmenFixed") ?? false,
        isSelfMade: firstPageForm.getValues("isSelfMade") ?? false
      }
      try {
        const data = await mutateTeamUpdate([initialData.id, updateData])
        await queryClient.invalidateQueries({
          queryKey: ["team", data.id],
          refetchType: "all"
        })
        await queryClient.invalidateQueries({
          queryKey: ["teams"],
          refetchType: "all"
        })
        await queryClient.invalidateQueries({
          queryKey: ["teams", "performance"],
          refetchType: "all"
        })
        router.push(ROUTES.PERFORMANCE.TEAM.DETAIL(data.performanceId, data.id))
      } catch {
        toast({
          title: "오류",
          description: "팀 수정 중 오류가 발생했습니다.",
          variant: "destructive"
        })
      }
    }
  }
  function onThirdPageInvalid(
    errors: FieldErrors<z.infer<typeof memberSessionRequiredBaseSchema>>
  ) {
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
                      initialData.performanceId,
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
