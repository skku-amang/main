import { BandSessionName } from "../../../packages/database/generated/prisma"

type SessionImageType = {
  UNPRESSED: Record<BandSessionName, string>
  PRESSED: Record<BandSessionName, string>
}

const SESSIONIMAGE: SessionImageType = {
  UNPRESSED: {
    VOCAL: "/vocal.svg",
    GUITAR: "/guitar.svg",
    BASS: "/bass.svg",
    DRUM: "/drums.svg",
    SYNTH: "/synth.svg",
    WINDS: "/flute.svg",
    STRINGS: "/violin.svg"
  },
  PRESSED: {
    VOCAL: "/vocal-colored.svg",
    GUITAR: "/guitar-colored.svg",
    BASS: "/bass-colored.svg",
    DRUM: "/drums-colored.svg",
    SYNTH: "/synth-colored.svg",
    WINDS: "/flute-colored.svg",
    STRINGS: "/violin-colored.svg"
  }
}

export default SESSIONIMAGE
