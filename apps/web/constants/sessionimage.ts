import { SessionName } from "@repo/shared-types"

type SessionImageType = {
  UNPRESSED: Record<SessionName, string>
  PRESSED: Record<SessionName, string>
}

const SESSIONIMAGE: SessionImageType = {
  UNPRESSED: {
    보컬: "/vocal.svg",
    기타: "/guitar.svg",
    베이스: "/bass.svg",
    드럼: "/drums.svg",
    신디: "/synth.svg",
    관악기: "/flute.svg",
    현악기: "/violin.svg"
  },
  PRESSED: {
    보컬: "/vocal-colored.svg",
    기타: "/guitar-colored.svg",
    베이스: "/bass-colored.svg",
    드럼: "/drums-colored.svg",
    신디: "/synth-colored.svg",
    관악기: "/flute-colored.svg",
    현악기: "/violin-colored.svg"
  }
}

export default SESSIONIMAGE
