export type PerformanceStatus = "예정" | "진행중" | "종료"
export const PerformanceStatus: PerformanceStatus[] = ["예정", "진행중", "종료"]

export type Performance = {
  id: number
  name: string
  description: string
  representativeImage: string
  location: string
  start_datetime: Date
  end_datetime: Date
  status: PerformanceStatus
}