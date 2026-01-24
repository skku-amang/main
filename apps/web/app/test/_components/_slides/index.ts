import { AvatarSlide } from "./Avatar.slide"
import { SearchBarSlide } from "./SearchBar.slide"

export type Slide = {
  key: string
  title: string
  content: React.ReactNode
}

export const slides = [SearchBarSlide, AvatarSlide]
