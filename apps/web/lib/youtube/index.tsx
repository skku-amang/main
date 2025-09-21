export interface YoutubeVideoInfo {
  author_name: string
  thumbnail_url: string
  author_url: string
  title: string
  provider_url: string
  height: number
  type: string
  html: string
  thumbnail_width: number
  width: number
  provider_name: string
  url: string
  thumbnail_height: number
  version: string
}

/**
 * https://developers.google.com/youtube/player_parameters
 */
export interface YoutubeVideoHTML {
  width?: number | string // 동영상 플레이어의 너비
  height?: number | string // 동영상 플레이어의 높이
  frameborder?: number // 프레임 테두리 두께
  allow?: string // 허용할 기능 목록
  autoplay?: 0 | 1 // 플레이어가 로드될 때 첫 번째 동영상을 자동으로 재생할지 여부 (0 또는 1)
  clipboardwrite?: boolean // 클립보드 쓰기 허용 여부
  allowfullscreen?: boolean // 전체 화면 허용 여부
  title?: string // 동영상 제목
  cc_lang_pref?: string // 자막 기본 언어 (ISO 639-1 두 자리 언어 코드)
  cc_load_policy?: 0 | 1 // 자막 기본 표시 여부 (0 또는 1)
  color?: "red" | "white" // 동영상 진행률 표시줄 색상 ('red' 또는 'white')
  controls?: 0 | 1 // 동영상 플레이어 컨트롤 표시 여부 (0 또는 1)
  disablekb?: 0 | 1 // 키보드 컨트롤 비활성화 여부 (0 또는 1)
  enablejsapi?: 0 | 1 // IFrame 또는 JavaScript Player API 호출을 통한 플레이어 제어 여부 (0 또는 1)
  end?: number // 동영상 재생 종료 시간 (초 단위)
  fs?: 0 | 1 // 전체 화면 버튼 표시 여부 (0 또는 1)
  hl?: string // 플레이어 인터페이스 언어 (ISO 639-1 두 자리 언어 코드)
  iv_load_policy?: 1 | 3 // 동영상 특수효과 기본 표시 여부 (1 또는 3)
  list?: string // 로드할 콘텐츠 식별자 (재생목록 ID 등)
  listType?: "playlist" | "search" | "user_uploads" // 로드할 콘텐츠 유형
  loop?: 0 | 1 // 동영상 반복 재생 여부 (0 또는 1)
  modestbranding?: 0 | 1 // YouTube 로고 표시 여부 (0 또는 1)
  origin?: string // IFrame API 추가 보안 수단
  playlist?: string // 재생할 동영상 ID 목록 (쉼표로 구분)
  playsinline?: 0 | 1 // iOS에서 동영상 인라인 재생 여부 (0 또는 1)
  rel?: 0 | 1 // 관련 동영상 표시 여부 (0 또는 1)
  start?: number // 동영상 재생 시작 시간 (초 단위)
  widget_referrer?: string // 플레이어가 삽입된 URL
}

/**
 * Youtube 비디오 정보를 가져오는 클래스
 * 비디오 ID와 썸네일은 초기화 없이도 가능하지만
 * 나머지 정보는 init() 메서드를 통해 가져올 수 있음
 *
 * @example
 * // 간단한 정보 가져오기
 * const videoId = YoutubeVideo.getVideoId('https://youtu.be/OU24A9C8BUk');
 * const videoThumbnail = YoutubeVideo.getThumbnail(videoId);
 *
 * @example
 * // 자세한 정보 가져오기
 * const video = new YoutubeVideo('https://youtu.be/OU24A9C8BUk');
 * video.init().then(() => {
 *  console.log(video.getInfo());
 * });
 */
class YoutubeVideo {
  private _videoId: string
  private _info?: YoutubeVideoInfo

  constructor(url: string) {
    this._videoId = YoutubeVideo.getVideoId(url)
  }

  public async init() {
    const res = await fetch(
      `http://noembed.com/embed?url=http%3A//www.youtube.com/watch?v=${this._videoId}`
    )
    if (!res.ok) {
      throw new Error(`Failed to fetch Youtube info: ${res.statusText}`)
    }
    const data = await res.json()

    this._info = data as YoutubeVideoInfo
  }

  public get videoId() {
    return this._videoId
  }

  public static getURL(videoId: string) {
    return `https://www.youtube.com/watch?v=${videoId}`
  }

  /**
   * 임베드를 할 때 일반 URL로는
   * `Refused to display 'https://www.youtube.com/' in a frame because it set 'X-Frame-Options' to 'sameorigin'.`
   * 에러가 발생하므로 embed URL을 사용해야 함
   */
  public static getEmbedURL(videoId: string) {
    return `https://www.youtube.com/embed/${videoId}`
  }

  public static getVideoId(url: string) {
    // case 1: https://youtu.be/OU24A9C8BUk
    if (url.includes("youtu.be/")) {
      const videoIdPart = url.split(".be/")[1]
      if (videoIdPart) {
        return videoIdPart.split("?")[0] as string
      }
    }
    // case 2: https://www.youtube.com/watch?v=zWvUFsWMmhY
    else if (url.includes("youtube.com/watch?v=")) {
      const videoIdPart = url.split("watch?v=")[1]
      if (videoIdPart) {
        return videoIdPart.split("?")[0] as string
      }
    }
    throw new TypeError(`Invalid Youtube URL: '${url}'`)
  }

  public static getValidVideoIdOrNull(url: string): string | null {
    try {
      return this.getVideoId(url)
    } catch (e) {
      if (e instanceof TypeError) return null
      throw e
    }
  }

  public isVideoIdValid(): boolean {
    try {
      return !!this._info?.title
    } catch (e) {
      if (e instanceof TypeError) {
        return false
      }
      throw e
    }
  }

  public static isUrlValid(url: string): boolean {
    try {
      return !!YoutubeVideo.getVideoId(url)
    } catch (e) {
      if (e instanceof TypeError) {
        return false
      }
      throw e
    }
  }

  public static getThumbnail(videoId: string) {
    return `https://img.youtube.com/vi/${videoId}/sddefault.jpg`
  }

  /**
   *
   * @example
   * const info = {
   *  author_name: 'AJRVEVO',
   *  thumbnail_url: 'https://i.ytimg.com/vi/OU24A9C8BUk/hqdefault.jpg',
   *  author_url: 'https://www.youtube.com/@ajrvevo1348',
   *  title: 'AJR - Maybe Man (Official Video)',
   *  provider_url: 'https://www.youtube.com/',
   *  height: 113,
   *  type: 'video',
   *  html: '<iframe width="200" height="113" src="https://www.youtube.com/embed/OU24A9C8BUk?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen title="AJR - Maybe Man (Official Video)"></iframe>',
   *  thumbnail_width: 480,
   *  width: 200,
   *  provider_name: 'YouTube',
   *  url: 'http://www.youtube.com/watch?v=OU24A9C8BUk',
   *  thumbnail_height: 360,
   *  version: '1.0'
   * }
   */
  public getInfo(): YoutubeVideoInfo {
    if (!this._info) {
      throw new Error("Youtube info is not initialized. Call init() first.")
    }
    return this._info
  }
}

export default YoutubeVideo
