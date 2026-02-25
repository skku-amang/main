"use client"

import { Check, Link2 } from "lucide-react"
import { useState } from "react"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

interface CopyRowLinkItemProps {
  rowId: number
}

export function CopyRowLinkItem({ rowId }: CopyRowLinkItemProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const url = new URL(window.location.href)
    url.searchParams.set("rowId", String(rowId))
    await navigator.clipboard.writeText(url.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <DropdownMenuItem onClick={handleCopy}>
      {copied ? (
        <Check className="mr-2 h-4 w-4 text-green-600" />
      ) : (
        <Link2 className="mr-2 h-4 w-4" />
      )}
      {copied ? "복사됨" : "링크 복사"}
    </DropdownMenuItem>
  )
}
