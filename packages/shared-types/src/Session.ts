/* eslint-disable no-unused-vars */
import { User } from "./User";

export type SessionName =
  | "보컬"
  | "기타"
  | "베이스"
  | "신디"
  | "드럼"
  | "현악기"
  | "관악기";

export type Session = {
  id: number;
  name: SessionName;
  leader?: User; // 세션장
  icon?: string;
};
