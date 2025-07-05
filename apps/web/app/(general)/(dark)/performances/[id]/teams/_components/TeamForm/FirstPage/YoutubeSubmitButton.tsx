import { Check } from "lucide-react"
import { FieldError } from "react-hook-form"

import { Button } from "@/components/ui/button"

interface YoutubeSubmitButtonProps {
  error?: FieldError
  isSubmitted: boolean
}

const YoutubeSubmitButton = ({
  error,
  isSubmitted
}: YoutubeSubmitButtonProps) => {
  if (error) {
    // Error
    return <div className="text-sm rounded text-destructive">Failed</div>
  } else if (isSubmitted) {
    // Success
    return (
      <div className="flex items-center gap-x-1 text-sm">
        <Check className="h-4 w-4 text-green-500" />
        Completed
      </div>
    )
  } else {
    // Default
    return (
      <Button
        type="submit"
        variant="outline"
        className="border border-secondary text-sm text-secondary"
      >
        Upload
      </Button>
    )
  }
}

export default YoutubeSubmitButton
