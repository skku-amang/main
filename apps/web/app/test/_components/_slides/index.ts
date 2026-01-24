import { AvatarSlide } from "./Avatar.slide"
import { BreadcumbSlide } from "./Breadcumb.slide"
import { CardSlide } from "./Card.slide"
import { CheckboxSlide } from "./Checkbox.slide"
import { DropdownSlide } from "./Dropdown.slide"
import { InputAreaSlide } from "./InputArea.slide"
import { SearchBarSlide } from "./SearchBar.slide"
import { ToastSlide } from "./Toast.slide"
import { VideoSlide } from "./Video.slide"

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
  CheckboxSlide,
  DropdownSlide,
  InputAreaSlide,
  ToastSlide,
  VideoSlide
]
