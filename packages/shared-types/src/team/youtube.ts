const VIDEO_ID_REGEX = /^[A-Za-z0-9_-]{11}$/

const YOUTUBE_HOSTNAMES = new Set([
  "www.youtube.com",
  "youtube.com",
  "m.youtube.com",
  "music.youtube.com"
])

/** URL에서 YouTube videoId를 추출. 실패 시 null 반환 */
export function extractYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    let videoId: string | null = null

    if (YOUTUBE_HOSTNAMES.has(parsed.hostname)) {
      if (parsed.pathname === "/watch") {
        // youtube.com/watch?v=xxx
        videoId = parsed.searchParams.get("v")
      } else {
        // youtube.com/shorts/xxx, /live/xxx, /embed/xxx, /v/xxx
        const match = parsed.pathname.match(/^\/(shorts|live|embed|v)\/([^/]+)/)
        if (match) {
          videoId = match[2] ?? null
        }
      }
    } else if (parsed.hostname === "youtu.be") {
      // youtu.be/xxx
      videoId = parsed.pathname.slice(1) || null
    }

    if (!videoId) return null
    return VIDEO_ID_REGEX.test(videoId) ? videoId : null
  } catch {
    return null
  }
}

/** Zod용 YouTube URL 검증 함수 */
export function isValidYoutubeUrl(url: string): boolean {
  return extractYoutubeVideoId(url) !== null
}

/** videoId → 표준 YouTube watch URL */
export function getYoutubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

/** videoId → iframe embed URL */
export function getYoutubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}

/** videoId → 썸네일 이미지 URL (sddefault) */
export function getYoutubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/sddefault.jpg`
}
