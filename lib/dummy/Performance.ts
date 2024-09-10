import { faker } from "@faker-js/faker"

import { Performance, PerformanceStatusValues } from "@/types/Performance"

import { customFaker } from "."

export const createPerformance = (id: number): Performance => {
  const HOUR = 60 * 60 * 1000
  const startDatetime = customFaker.date.future({ years: 5 })
  const endDatetime = new Date(startDatetime.getTime() + 8 * HOUR)
  let fakerWithSeed = faker
  fakerWithSeed.seed(customFaker.seed())

  return {
    id,
    name: `${startDatetime.getFullYear().toString()}년 정기공연`,
    description: customFaker.lorem.text(),
    representativeImage: customFaker.image.url(),
    location: fakerWithSeed.location.streetAddress(), // 한국 locale은 지원 안함
    startDatetime: startDatetime.toString(),
    endDatetime: endDatetime.toString(),
    status: customFaker.helpers.arrayElement(PerformanceStatusValues)
  }
}
