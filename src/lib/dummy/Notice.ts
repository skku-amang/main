import { faker } from "@faker-js/faker";
import { Notice } from "../../../types/Notice";
import { createUser } from "./User";

export const createNotice = (id: number): Notice => ({
  id,
  title: faker.lorem.sentence(),
  content: faker.lorem.paragraphs(),
  author: createUser(id),
  createdDatetime: faker.date.past(),
  editedDatetime: faker.date.recent(),
});