import React from "react"

import { Button } from "@/components/ui/button"
import { ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const MobileButton = (props: ButtonProps) => {
  const { children, className } = props

  return (
    <Button className={cn("h-10 w-10 p-2 rounded-lg", className)} {...props}>
      {children}
    </Button>
  )
}

export default MobileButton