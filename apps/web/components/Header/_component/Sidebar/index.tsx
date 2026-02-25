import { Menu } from "lucide-react"
import React from "react"

import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/Header/_component/Sidebar/Sheet"
import SheetInnerContent from "@/components/Header/_component/Sidebar/SheetInnerContent"
import { SheetTitle } from "@/components/ui/sheet"

const Sidebar = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button type="button">
        <Menu className="h-6 w-6 text-white" />
      </button>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button type="button">
          <Menu className="h-6 w-6 text-white" />
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle className="hidden">메뉴</SheetTitle>
        <SheetInnerContent setIsOpen={setIsOpen} />
      </SheetContent>
    </Sheet>
  )
}

export default Sidebar
