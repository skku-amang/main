import React from "react";

import { FormDescription } from "@/components/ui/form";

const SimpleDescription = ({ children }: { children: React.AwaitedReactNode }) => {
  return (
    <>
      {children &&
        <FormDescription className="text-xs">
          {children}
        </FormDescription>
      }
    </>
  )
}

export default SimpleDescription