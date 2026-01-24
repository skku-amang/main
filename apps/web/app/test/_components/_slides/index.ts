import { AvatarSlide } from "./Avatar.slide"
import { BreadcumbSlide } from "./Breadcumb.slide"
import { CardSlide } from "./Card.slide"
import { CheckboxSlide } from "./Checkbox.slide"
import { SearchBarSlide } from "./SearchBar.slide"

export type Slide = {
  key: string
  title: string
  content: React.ReactNode
}

export const slides = [
  SearchBarSlide,
  AvatarSlide,
  BreadcumbSlide,
  CardSlide,
  CheckboxSlide
]
