import type { Metadata } from "next"

import { SEO } from "@/constants/seo"
import { apiClient } from "@/lib/apiClient"

import TeamDetailClient from "./_components/TeamDetailClient"

type Props = { params: Promise<{ id: string; teamId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, teamId } = await params
  try {
    const team = await apiClient.getTeamById(Number(teamId))
    const title = `${team.songArtist} - ${team.songName}`
    const description = `${team.name} | ${team.songArtist} - ${team.songName}`

    return {
      title,
      description,
      alternates: {
        canonical: `/performances/${id}/teams/${teamId}`
      },
      openGraph: {
        title: `${title} | AMANG`,
        description,
        images: team.posterImage
          ? [{ url: team.posterImage, alt: title }]
          : [{ url: SEO.DEFAULT_OG_IMAGE, alt: SEO.SITE_NAME }]
      }
    }
  } catch {
    return { title: "팀 정보" }
  }
}

export default function TeamDetailPage() {
  return <TeamDetailClient />
}
