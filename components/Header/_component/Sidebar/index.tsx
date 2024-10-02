import { RxHamburgerMenu } from "react-icons/rx"

import { Sheet, SheetContent, SheetTrigger } from "@/components/Header/_component/Sidebar/Sheet"
import SheetInnerContent from "@/components/Header/_component/Sidebar/SheetInnerContent"

const Sidebar = () => {

    return (

        <Sheet>
        <SheetTrigger><RxHamburgerMenu className="text-white w-9 h-9"/></SheetTrigger>
          <SheetContent>
            <SheetInnerContent/>
         </SheetContent>
        </Sheet>

    )

}

export default Sidebar