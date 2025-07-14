import React from "react"

import { FormDescription } from "../ui/form"

const SimpleDescription = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children && (
        <FormDescription className="text-xs">{children}</FormDescription>
      )}
    </>
  )
}

export default SimpleDescription
