"use client"

import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import * as React from "react"

import { cn } from "../../lib/utils"
import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CheckboxWithInput = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => {

  const [selectOpen, setSelectOpen] = React.useState(false);

  const toggleSelect = () => {
    setSelectOpen(!selectOpen);
  }

  return(
  <div className="w-full h-full flex items-center gap-20" >
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          "peer h-6 w-6 shrink-0 rounded-sm border border-slate-400 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-sky-700 data-[state=checked]:text-primary-foreground",
          className,   
        )}
        {...props}
        onClick= {toggleSelect}
      >
        <CheckboxPrimitive.Indicator
          className={cn("flex items-center justify-center text-current")}
          onClick= {toggleSelect}
        >
          <Check className="h-4 w-4"
          onClick= {toggleSelect}/>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <Select>
        <SelectTrigger className={`w-[170px] z-10 ${selectOpen ? '' : 'hidden'}`}>
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent className={`${selectOpen ? '' : 'hidden'}`}>
            <SelectGroup>
              <SelectLabel>멤버</SelectLabel>
                <SelectItem value="apple">김영주</SelectItem>
                <SelectItem value="banana">손장수</SelectItem>
                <SelectItem value="blueberry">박진우</SelectItem>
                <SelectItem value="grapes">김수연</SelectItem>
                <SelectItem value="pineapple">남승민</SelectItem>
                <SelectItem value="pineapple">권태환</SelectItem>
            </SelectGroup>
          </SelectContent>
      </Select>
  </div>
  )
})
CheckboxWithInput.displayName = CheckboxPrimitive.Root.displayName

export { CheckboxWithInput }
