import { Notice } from "../../types/Notice";
import { customFaker } from ".";
import { createUser } from "./User";

export const createNotice = (id: number): Notice => ({
  id,
  title: customFaker.lorem.sentence(),
  content: customFaker.lorem.paragraphs(),
  author: createUser(id),
  createdDatetime: customFaker.date.past(),
  editedDatetime: customFaker.date.recent(),
});