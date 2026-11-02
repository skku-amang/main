// 녹음본은 한 번에 한 곡만 — 하나가 재생을 시작하면 나머지는 멈춘다
const PLAY_EVENT = "amang:recording-play"

/** 이 녹음본(src)이 재생을 시작한다고 알린다 */
export function announceRecordingPlay(src: string) {
  window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: src }))
}

/** 다른 녹음본이 재생을 시작하면 onOther를 부른다. 반환값은 구독 해제 */
export function onOtherRecordingPlay(src: string, onOther: () => void) {
  const listener = (e: Event) => {
    if ((e as CustomEvent<string>).detail !== src) onOther()
  }
  window.addEventListener(PLAY_EVENT, listener)
  return () => window.removeEventListener(PLAY_EVENT, listener)
}

export const formatPlaybackTime = (sec: number) =>
  Number.isFinite(sec)
    ? `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`
    : "0:00"
