"use client"

import { redirect, useRouter } from "next/navigation"
import { parseAsInteger, useQueryState } from "nuqs"

import { useToast } from "@/components/hooks/use-toast"
import ROUTES from "@/constants/routes"
import { cn } from "@/lib/utils"
import { CreateTeamSchema, Team, TeamSessionSchema } from "@repo/shared-types"

import { useCreateTeam, useUpdateTeam } from "@/hooks/api/useTeam"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import z from "zod"
import FirstPage from "./FirstPage"
import SecondPage from "./SecondPage"
import ThirdPage from "./ThirdPage"

export const FirstPageSchema = CreateTeamSchema.pick({
  description: true,
  leaderId: true,
  performanceId: true,
  posterImage: true,
  songName: true,
  songArtist: true,
  isFreshmenFixed: true,
  isSelfMade: true,
  songYoutubeVideoUrl: true
})
export const SecondPageSchema = z.object({
  teamSessions: z.array(
    TeamSessionSchema.pick({ sessionId: true, capacity: true })
  )
})
export const ThirdPageSchema = z.object({
  teamSessions: z.array(TeamSessionSchema.pick({ members: true }))
})

type TeamFormProps = { className?: string } & (
  | {
      initialData?: undefined
      useCreateOrUpdateTeam: ReturnType<typeof useCreateTeam>
    }
  | {
      initialData: Team
      useCreateOrUpdateTeam: ReturnType<typeof useUpdateTeam>
    }
)

const TeamForm = ({
  initialData,
  useCreateOrUpdateTeam,
  className
}: TeamFormProps) => {
  const { mutate, isError, data } = useCreateOrUpdateTeam
  const router = useRouter()
  const { toast } = useToast()
  const session = useSession()
  const userId = session.data?.user?.id
  if (!userId) redirect(ROUTES.LOGIN)

  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1)
  )

  const firstPageForm = useForm({
    resolver: zodResolver(FirstPageSchema),
    defaultValues: { ...initialData, leaderId: Number(userId) }
  })
  const secondPageForm = useForm({
    resolver: zodResolver(SecondPageSchema),
    defaultValues: {
      teamSessions:
        initialData?.teamSessions.map((session) => ({
          sessionId: session.sessionId,
          capacity: session.capacity
        })) ?? []
    }
  })
  const thirdPageForm = useForm({
    resolver: zodResolver(ThirdPageSchema),
    defaultValues: {
      teamSessions:
        initialData?.teamSessions.map((session) => ({
          members: session.members.map((member) => ({
            userId: member.userId,
            index: member.index
          }))
        })) ?? []
    }
  })

  return (
    <div className={cn(`mb-20 rounded-2xl shadow-2xl`, className)}>
      {currentPage === 1 && (
        <FirstPage
          form={firstPageForm}
          onValid={() => setCurrentPage(2)}
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
          onPrevious={() => setCurrentPage(1)}
        />
      )}
      {currentPage === 3 && (
        <ThirdPage
          form={thirdPageForm}
          onValid={onThirdPageValid}
          onPrevious={() => setCurrentPage(2)}
        />
      )}
    </div>
  )
}

export default TeamForm
