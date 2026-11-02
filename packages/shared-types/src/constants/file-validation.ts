export const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

// 녹음본 — 음원만 (mp3, m4a, wav). 브라우저마다 m4a·wav 타입 이름이 달라 변형을 함께 받는다
export const ACCEPTED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/wave"
]

export const MAX_RECORDING_SIZE = 50 * 1024 * 1024 // 50MB

/** 저장 키의 확장자는 파일명이 아니라 형식에서 정한다 — 이상한 파일명이 와도 키 모양이 일정하게 */
export const RECORDING_EXTENSION_BY_TYPE: Record<string, string> = {
  "audio/mpeg": ".mp3",
  "audio/mp4": ".m4a",
  "audio/x-m4a": ".m4a",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
  "audio/wave": ".wav"
}

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp"
]
