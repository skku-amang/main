import { PrismaClient } from "../../generated/prisma"
import { EquipCategory } from "../../generated/prisma"

export const seedEquipment = async (prisma: PrismaClient) => {
  console.log("Seeding equipment...")
  await Promise.all([
    prisma.equipment.upsert({
      where: { id: 1 },
      update: {},
      create: {
        brand: "Corona",
        model: "Mordern Plus T",
        category: EquipCategory.GUITAR,
        description: "색상: black"
      }
    }),
    prisma.equipment.upsert({
      where: { id: 2 },
      update: {},
      create: {
        brand: "Zildjian",
        model: "Unknown",
        category: EquipCategory.DRUM,
        description: "14인치/36cm 하이햇"
      }
    }),
    prisma.equipment.upsert({
      where: { id: 3 },
      update: {},
      create: {
        brand: "SHURE",
        model: "PGA48",
        category: EquipCategory.MICROPHONE
      }
    }),
    prisma.equipment.upsert({
      where: { id: 4 },
      update: {},
      create: {
        brand: "Inter M",
        model: "CMX - 1664 mixing console",
        category: EquipCategory.MIXER
      }
    }),
    prisma.equipment.upsert({
      where: { id: 5 },
      update: {},
      create: {
        brand: "Squier",
        model: "affinity series precision bass",
        category: EquipCategory.BASS
      }
    }),
    prisma.equipment.upsert({
      where: { id: 6 },
      update: {},
      create: {
        brand: "ALTO Professional",
        model: "TS112A",
        category: EquipCategory.SPEAKER
      }
    }),
    prisma.equipment.upsert({
      where: { id: 7 },
      update: {},
      create: {
        brand: "Roland",
        model: "RD-88",
        description: "88키",
        category: EquipCategory.SYNTHESIZER
      }
    }),
    prisma.equipment.upsert({
      where: { id: 8 },
      update: {},
      create: {
        brand: "Marshall",
        model: "MG50GFX COMBO",
        description: "기타 앰프, 전력량: 50W",
        category: EquipCategory.AMPLIFIER
      }
    }),
    prisma.equipment.upsert({
      where: { id: 9 },
      update: {},
      create: {
        brand: "Forcusrite",
        model: "scarlett 18i20",
        category: EquipCategory.AUDIO_INTERFACE
      }
    }),
    prisma.equipment.upsert({
      where: { id: 10 },
      update: {},
      create: {
        brand: "Muztek",
        model: "Unknown",
        description: "5.5 to 5.5",
        category: EquipCategory.CABLE
      }
    })
  ])

  console.log("Seeding equipment completed.")
}
