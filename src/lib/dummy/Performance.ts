import { faker } from "@faker-js/faker";

import { Performance, PerformanceStatus } from "../../../types/Performance";
import { customFaker } from ".";

export const createPerformance = (id: number): Performance => {
  const HOUR = 60 * 60 * 1000
  const start_datetime = customFaker.date.future({ years: 5 });
  const end_datetime = new Date(start_datetime.getTime() + 8 * HOUR)

  return {
    id,
    name: `${start_datetime.getFullYear().toString()}년 정기공연`,
    description: customFaker.lorem.text(),
    representativeImage: customFaker.image.url(),
    location: faker.location.streetAddress(),   // 한국 locale은 지원 안함
    start_datetime,
    end_datetime,
    status: customFaker.helpers.arrayElement(PerformanceStatus)
  };
};