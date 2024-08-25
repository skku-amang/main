import { faker } from "@faker-js/faker";
import { Performance, PerformanceStatus } from "../../../types/Performance";

export const createPerformance = (id: number): Performance => {
  const HOUR = 60 * 60 * 1000
  const start_datetime = faker.date.future({ years: 5 });
  const end_datetime = new Date(start_datetime.getTime() + 8 * HOUR)

  return {
    id,
    name: `${start_datetime.getFullYear().toString()}년 정기공연`,
    description: faker.lorem.text(),
    representativeImage: faker.image.url(),
    location: faker.location.streetAddress(),
    start_datetime,
    end_datetime,
    status: faker.helpers.arrayElement(PerformanceStatus)
  };
};