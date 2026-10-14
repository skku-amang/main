import { Metadata } from "next"

import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import ROUTES from "@/constants/routes"

import SuggestionForm from "./_components/SuggestionForm"

export const metadata: Metadata = {
  title: "의견 보내기"
}

export default function SuggestionsPage() {
  return (
    <div>
      <DefaultPageHeader
        title="의견 보내기"
        routes={[
          { display: <DefaultHomeIcon />, href: ROUTES.HOME },
          { display: "의견 보내기" }
        ]}
      />
      <div className="mx-auto max-w-2xl">
        <SuggestionForm />
      </div>
    </div>
  )
}
