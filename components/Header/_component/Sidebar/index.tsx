import { Menu } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/Header/_component/Sidebar/Sheet"
import SheetInnerContent from "@/components/Header/_component/Sidebar/SheetInnerContent"

const Sidebar = () => {
  return (
    <Sheet>
      <SheetTrigger>
        <Menu className="h-9 w-9 text-white" />
      </SheetTrigger>
      <SheetContent>
        <SheetInnerContent />
      </SheetContent>
    </Sheet>
  )
}

export default Sidebar
