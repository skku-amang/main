"use client"

import { Separator } from "@radix-ui/react-separator"
import { Maximize2 } from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import ApplyButton from "@/app/(general)/(dark)/performances/[id]/teams/[teamId]/_components/ApplyButton"
import BasicInfo from "@/app/(general)/(dark)/performances/[id]/teams/[teamId]/_components/BasicInfo"
import DeleteEditButton from "@/app/(general)/(dark)/performances/[id]/teams/[teamId]/_components/DeleteEditButton"
import MemberSessionCard from "@/app/(general)/(dark)/performances/[id]/teams/[teamId]/_components/MemberSessionCard"
import SessionSetCard from "@/app/(general)/(dark)/performances/[id]/teams/[teamId]/_components/SessionSetCard"
import Loading from "@/app/_(errors)/Loading"
import NotFoundPage from "@/app/_(errors)/NotFound"
import OleoPageHeader from "@/components/PageHeaders/OleoPageHeader"
import SessionBadge from "@/components/TeamBadges/SessionBadge"
import { Button } from "@/components/ui/button"
import ROUTES from "@/constants/routes"
import { getSessionDisplayName } from "@/constants/session"
import { useTeam } from "@/hooks/api/useTeam"
import { getMissingIndices } from "@/lib/team/teamSession"
import YoutubePlayer from "@/lib/youtube/Player"
import useTeamApplication from "./_hooks/useTeamApplication"

interface TeamDetailProps {
  params: {
    id: string
    teamId: string
  }
}

const TeamDetail = (props: TeamDetailProps) => {
  const session = useSession()
  const router = useRouter()

  const performanceId = Number(props.params.id)
  const id = Number(props.params.teamId)

  const { data: team, isLoading, isError } = useTeam(id)
  const {
    selectedSessions,
    isSelected,
    onAppendSession,
    onRemoveSession,
    onSubmit
  } = useTeamApplication(id)

  if (session.status === "unauthenticated") router.push(ROUTES.LOGIN)

  if (isLoading) {
    return <Loading />
  } else if (isError) {
    return <div>Error</div>
  } else if (!team) {
    return <NotFoundPage />
  }

  return (
    <div className="container flex w-full flex-col items-center px-0 pt-16">
      {/* 기울어진 배경 - 슬레이트 */}
      <div
        className="absolute left-0 top-0 z-0 h-[283px] w-full bg-slate-300 md:h-[600px]"
        style={{ clipPath: "polygon(0 0%, 80% 0, 180% 65%, 0% 100%)" }}
      />

      {/* 기울어진 배경 - 프라이머리 */}
      <div
        className="absolute left-0 top-0 h-[283px] w-full bg-primary md:h-[600px]"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 60%, 0% 100%)" }}
      />

      {/* 페이지 헤더 */}
      <OleoPageHeader
        title="Join Your Team"
        goBackHref={ROUTES.PERFORMANCE.TEAM.LIST(performanceId)}
        className="relative mb-10"
      />

      {/* 유튜브 임베드 */}
      <div className="relative z-10 flex w-full items-center justify-center pb-[20px] md:pb-[49px]">
        {team.songYoutubeVideoUrl && (
          <YoutubePlayer
            videoUrl={team.songYoutubeVideoUrl}
            className="mx-10 aspect-video h-auto w-full md:h-[673px] md:w-[1152px]"
          />
        )}
      </div>

      {/*수정 및 삭제 (모바일)*/}
      {session.data &&
        (session.data.user.isAdmin ||
          (session.data.user.id &&
            +session.data.user.id === team.leaderId)) && (
          <div className="block h-auto w-[93%] justify-items-end pb-5  md:hidden  min-[878px]:w-11/12 lg:w-5/6">
            <DeleteEditButton
              performanceId={performanceId}
              team={team}
              accessToken={session.data?.accessToken}
            />
          </div>
        )}

      <div className="flex w-full gap-[24px] max-md:flex-col max-md:items-center md:flex md:w-[1152px]">
        {/* 기본 정보 및 포스터*/}
        <div className="flex w-full flex-col gap-y-[24px]">
          <BasicInfo
            team={team}
            canEdit={
              !!session.data &&
              (session.data.user.isAdmin ||
                (!!session.data.user.id &&
                  +session.data.user.id === team.leaderId))
            }
          />
          <div className="hidden w-full overflow-clip md:block">
            {team.posterImage && (
              <Image
                className="rounded-lg"
                src={team.posterImage}
                alt="poster"
                fill
              />
            )}
            <div className="absolute bottom-[16px] right-[16px] flex h-11 w-11 animate-pulse items-center justify-center rounded-[10px] bg-gray-600/50 md:hidden">
              <Maximize2 className="text-white" />
            </div>
          </div>
        </div>

        {/* 세션 구성 */}
        <div className="flex h-full w-[93%] flex-col gap-y-5 md:w-[662px]">
          {/* 세션 구성 */}
          {team.teamSessions && team.teamSessions.length > 0 && (
            <SessionSetCard
              header="세션구성"
              className="h-fit bg-white shadow-md"
            >
              <div className="flex flex-wrap gap-x-2 gap-y-2 pt-[20px] md:pt-[40px]">
                {team.teamSessions.map((ts) => {
                  // capacity만큼의 슬롯을 모두 표시 (1부터 capacity까지)
                  return Array.from(
                    { length: ts.capacity },
                    (_, i) => i + 1
                  ).map((index) => {
                    const sessionWithIndex = `${getSessionDisplayName(ts.session.name)}${index}`
                    return (
                      <SessionBadge
                        key={`${ts.session.id}-${index}`}
                        session={sessionWithIndex}
                        className="h-[22px] w-[56px] justify-center rounded bg-slate-200 px-[5px] py-[6px] text-xs hover:bg-slate-300 md:h-[34px] md:w-[74px] md:rounded-[20px] md:text-base"
                      />
                    )
                  })
                })}
              </div>
            </SessionSetCard>
          )}

          {/* 마감된 세션 */}
          <SessionSetCard
            header="마감된 세션"
            className="col-span-2 bg-white shadow-md"
          >
            <div className="grid grid-cols-1">
              <div className="mt-4 hidden text-sm font-medium leading-normal text-slate-500 md:flex">
                <div className="flex h-[48px] w-[160px] items-center pl-4">
                  Session
                </div>
                <div className="flex h-[48px] w-[466px] items-center pl-4">
                  Member
                </div>
              </div>
              <Separator className="hidden h-[1.5px] w-full bg-slate-200 md:block" />
              {team.teamSessions?.map((ts) =>
                ts.members.map((member) => (
                  <MemberSessionCard
                    key={`${ts.session.id}-${member.index}`}
                    teamId={id}
                    sessionId={ts.session.id}
                    sessionName={ts.session.name}
                    sessionIndex={member.index}
                    user={member.user}
                    onUnapplySuccess={() => {}}
                  />
                ))
              )}
              {team.teamSessions?.every((ts) => ts.members.length === 0) && (
                <div className="py-4 text-center text-sm text-gray-400">
                  아직 참여한 멤버가 없습니다.
                </div>
              )}
            </div>
          </SessionSetCard>

          {/* 팀 참여 신청 */}
          <SessionSetCard
            header="세션 지원"
            className="col-span-2 bg-white shadow-md"
          >
            <ul className="mb-6 w-full pt-[12px] text-xs font-normal leading-normal text-gray-600 md:w-[537px] md:pt-[16px]">
              <li className="mb-1 md:mb-[10px]">
                ・아래 버튼을 눌러 해당 팀에 참여 신청을 할 수 있으며,
                선착순으로 마감됩니다
              </li>
              <li>
                ・아래 버튼을 다시 누르거나 마이페이지에 접속하여 신청을 취소할
                수 있습니다
              </li>
            </ul>

            {/* 빈 자리 세션 버튼들 */}
            <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap">
              {team.teamSessions?.map((ts) => {
                const missingIndices = getMissingIndices(ts)
                return missingIndices.map((index) => {
                  const selected = isSelected(ts.session.id, index)
                  return (
                    <ApplyButton
                      key={`apply-${ts.session.id}-${index}`}
                      sessionName={ts.session.name}
                      sessionIndex={index}
                      isSelected={selected}
                      onToggle={() => {
                        if (selected) {
                          onRemoveSession(ts.session.id, index)
                        } else {
                          onAppendSession(ts.session.id, index)
                        }
                      }}
                    />
                  )
                })
              })}
            </div>

            {/* 지원하기 버튼 */}
            {selectedSessions.length > 0 && (
              <Button className="mt-6 w-full" onClick={onSubmit}>
                선택한 세션에 지원하기 ({selectedSessions.length}개)
              </Button>
            )}

            {team.teamSessions?.every(
              (ts) => getMissingIndices(ts).length === 0
            ) && (
              <div className="py-4 text-center text-sm text-gray-400">
                모든 세션이 마감되었습니다.
              </div>
            )}
          </SessionSetCard>
        </div>
      </div>
    </div>
  )
}

export default TeamDetail
