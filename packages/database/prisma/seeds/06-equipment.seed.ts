import { PrismaClient } from "../../generated/prisma"
import { EquipCategory } from "../../generated/prisma"

export const seedEquipment = async (prisma: PrismaClient) => {
  console.log("Seeding Amang Room...")

  await prisma.equipment.create({
    data: {
      category: EquipCategory.ROOM,
      brand: "AMANG",
      model: "ROOM",
      description: "아망의 동아리방입니다.",
      image: "https://picsum.photos/200/300"
    }
  })
  console.log("Seeding Amang Room completed.")

  console.log("Seeding Equipment...")

  const EQUIPMENT_DATA = [
    {
      category: EquipCategory.AMPLIFIER,
      brand: "Behringer",
      model: "HA400",
      description: "인이어 앰프"
    },
    {
      category: EquipCategory.GUITAR,
      brand: "Corona",
      model: "Mordern Plus T",
      description: "색상: black"
    },
    {
      category: EquipCategory.GUITAR,
      brand: "Cort",
      model: "x-100"
    },
    {
      category: EquipCategory.GUITAR,
      brand: "Kawasamy",
      model: "Kawasamy proffesional"
    },
    {
      category: EquipCategory.GUITAR,
      brand: "Corona",
      model: "Standard Plus ST",
      description: "색상: shell pink"
    },
    {
      category: EquipCategory.GUITAR,
      brand: "Dexter",
      model: "D-250 3TS"
    },
    {
      category: EquipCategory.GUITAR,
      brand: "Moore",
      model: "GE200"
    },
    {
      category: EquipCategory.GUITAR,
      brand: "Swing",
      model: "P2",
      description: "색상: sunburst"
    },
    {
      category: EquipCategory.GUITAR,
      brand: "Epiphone",
      model: "Les Paul 1956 Goldtop",
      description: "레스폴"
    },
    {
      category: EquipCategory.DRUM,
      brand: "Zildjian",
      model: "14인치/36cm 하이햇",
      description: "드럼은 하나로 간주"
    },
    {
      category: EquipCategory.DRUM,
      brand: "Zildjian",
      model: "16인치/40cm 좌측 크래쉬 심벌"
    },
    {
      category: EquipCategory.DRUM,
      brand: "Zildjian",
      model: "18인치/45cm 우측 크래쉬 심벌",
      description: "파손 상태 심함 / 교체 예정"
    },
    {
      category: EquipCategory.DRUM,
      brand: "PEARL",
      model: "킥 페달 여분",
      description: "1개"
    },
    {
      category: EquipCategory.DRUM,
      brand: "Zildjian",
      model: "21인치/53cm 라이드 심벌"
    },
    {
      category: EquipCategory.DRUM,
      brand: "EVANS G2",
      model: "스네어 코팅 헤드"
    },
    {
      category: EquipCategory.DRUM,
      brand: "MAPEX",
      model: "스네어"
    },
    {
      category: EquipCategory.DRUM,
      brand: "TRUETONE",
      model: "스네어 와이어",
      description: "20줄"
    },
    {
      category: EquipCategory.DRUM,
      brand: "EVANS EC2",
      model: "스몰 탐 / 미들 탐 / 플로어 탐 / 킥 드럼 코팅 헤드",
      description: "개당 1개 총 4개"
    },
    {
      category: EquipCategory.DRUM,
      brand: "MAPEX",
      model: "스몰 탐 / 미들 탐 / 플로어 탐 / 킥 드럼",
      description: "총 4개"
    },
    {
      category: EquipCategory.DRUM,
      brand: "MEINL",
      model: "10인치 스플래쉬 심벌"
    },
    {
      category: EquipCategory.DRUM,
      brand: "PEARL",
      model: "킥 페달",
      description: "2개"
    },
    {
      category: EquipCategory.MICROPHONE,
      brand: "SHURE",
      model: "PGA48"
    },
    {
      category: EquipCategory.MICROPHONE,
      brand: "Beyerdynamic",
      model: "Unknown"
    },
    {
      category: EquipCategory.MIXER,
      brand: "Inter M",
      model: "CMX - 1664 mixing console"
    },
    {
      category: EquipCategory.BASS,
      brand: "Squier",
      model: "affinity series precision bass",
      description: "4현, 패시브"
    },
    {
      category: EquipCategory.BASS,
      brand: "Peavey",
      model: "international series",
      description: "4현, 패시브"
    },
    {
      category: EquipCategory.SPEAKER,
      brand: "ALTO Professional",
      model: "TS112A",
      description: "2개, 800W"
    },
    {
      category: EquipCategory.SYNTHESIZER,
      brand: "Roland",
      model: "RD-88",
      description: "88키"
    },
    {
      category: EquipCategory.SYNTHESIZER,
      brand: "KURZWEIL",
      model: "SP4-8",
      description: "88키"
    },
    {
      category: EquipCategory.SYNTHESIZER,
      brand: "M audio",
      model: "keystation88 MK3",
      description: "88키"
    },
    {
      category: EquipCategory.AMPLIFIER,
      brand: "Marshall",
      model: "MG50GFX COMBO",
      description: "기타 앰프, 전력량: 50W"
    },
    {
      category: EquipCategory.AMPLIFIER,
      brand: "Fender",
      model: "Rumble 100",
      description: "베이스 앰프, 전력량: 100W"
    },
    {
      category: EquipCategory.AMPLIFIER,
      brand: "Fender",
      model: "Champion 100",
      description: "기타 앰프, 전력량:  100W"
    },
    {
      category: EquipCategory.AUDIO_INTERFACE,
      brand: "Forcusrite",
      model: "scarlett 18i20"
    },
    {
      category: EquipCategory.CABLE,
      brand: "Muztek",
      model: "5.5 to 5.5",
      description: "얼룩무늬"
    },
    {
      category: EquipCategory.CABLE,
      brand: "Cort",
      model: "5.5 to 5.5"
    },
    {
      category: EquipCategory.CABLE,
      brand: "Unknown",
      model: "5.5 to 5.5",
      description: "4개, 브랜드 및 모델명 확인 어려움"
    },
    {
      category: EquipCategory.CABLE,
      brand: "Kirlin",
      model: "IPW-201WG 3M GR",
      description: "5.5 to 5.5, 야광색"
    },
    {
      category: EquipCategory.CABLE,
      brand: "CODEWAY",
      model: "5.5 to 5.5",
      description: "4개, 얇음. 노이즈 심함"
    },
    {
      category: EquipCategory.CABLE,
      brand: "Unknown",
      model: "XLR to XLR",
      description: "7개, 마이크 케이블"
    }
  ]

  await prisma.equipment.createMany({
    data: EQUIPMENT_DATA.map((equip) => ({
      ...equip,
      image: "https://picsum.photos/200/300"
    }))
  })
  console.log("Seeding Equipment completed.")
}
