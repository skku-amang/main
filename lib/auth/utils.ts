export function decodeToken(token: string) {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString())
}

export function isAccessTokenExpired(token: string): boolean {
  const { exp } = decodeToken(token)
  const currentTime = Math.floor(Date.now() / 1000) // 현재 시간을 초 단위 Unix 타임스탬프로 변환
  return exp < currentTime
}
