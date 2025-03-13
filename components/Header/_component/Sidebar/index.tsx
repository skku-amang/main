import { Menu } from "lucide-react"
import React from "react"

import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/Header/_component/Sidebar/Sheet"
import SheetInnerContent from "@/components/Header/_component/Sidebar/SheetInnerContent"

const Sidebar = () => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger>
        <Menu className="h-6 w-6 text-white" />
      </SheetTrigger>
      <SheetContent>
        <SheetInnerContent setIsOpen={setIsOpen} />
      </SheetContent>
    </Sheet>
  )
}

export default Sidebar
