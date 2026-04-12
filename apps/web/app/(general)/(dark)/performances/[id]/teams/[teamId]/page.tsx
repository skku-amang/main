import type { Metadata } from "next"

import { SEO } from "@/constants/seo"
import { apiClient } from "@/lib/apiClient"

import TeamDetailClient from "./_components/TeamDetailClient"

type Props = { params: Promise<{ id: string; teamId: string }> }

function getYoutubeThumbnail(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  )
  return match
    ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`
    : null
}

function getOgImage(
  team: { image?: string | null; songYoutubeVideoUrl?: string | null },
  alt: string
) {
  if (team.image) return { url: team.image, alt }
  if (team.songYoutubeVideoUrl) {
    const thumb = getYoutubeThumbnail(team.songYoutubeVideoUrl)
    if (thumb) return { url: thumb, alt }
  }
  return { url: SEO.DEFAULT_OG_IMAGE, alt: SEO.SITE_NAME }
}

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
        images: [getOgImage(team, title)]
      }
    }
  } catch {
    return { title: "팀 정보" }
  }
}

export default function TeamDetailPage() {
  return <TeamDetailClient />
}
