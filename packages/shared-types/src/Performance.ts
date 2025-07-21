export type PerformanceStatus = "예정" | "진행중" | "종료";
export const PerformanceStatusValues: PerformanceStatus[] = [
  "예정",
  "진행중",
  "종료",
];

export type Performance = {
  id: number;
  name: string;
  description?: string;
  representativeImage?: string;
  location?: string;
  startDatetime?: string;
  endDatetime?: string;
  status: PerformanceStatus;
};
