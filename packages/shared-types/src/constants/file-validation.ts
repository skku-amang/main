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

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp"
]
