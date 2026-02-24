"use client"

import { useRouter } from "next/navigation"
import { createContext, useCallback, useContext, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

interface UnsavedChangesContextValue {
  isDirty: boolean
  setDirty: (dirty: boolean) => void
  guardNavigation: (href: string) => boolean
}

const UnsavedChangesContext = createContext<UnsavedChangesContextValue>({
  isDirty: false,
  setDirty: () => {},
  guardNavigation: () => false
})

export function useUnsavedChanges() {
  return useContext(UnsavedChangesContext)
}

export function UnsavedChangesProvider({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [dirty, setDirty] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  const guardNavigation = useCallback(
    (href: string): boolean => {
      if (dirty) {
        setPendingHref(href)
        return true
      }
      return false
    },
    [dirty]
  )

  return (
    <UnsavedChangesContext.Provider
      value={{ isDirty: dirty, setDirty, guardNavigation }}
    >
      {children}

      <Dialog
        open={pendingHref !== null}
        onOpenChange={(open) => {
          if (!open) setPendingHref(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>저장하지 않고 나가시겠습니까?</DialogTitle>
            <DialogDescription>
              변경사항이 저장되지 않았습니다. 저장하지 않고 나가면 변경사항이
              사라집니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingHref(null)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const href = pendingHref
                setDirty(false)
                setPendingHref(null)
                if (href) router.push(href)
              }}
            >
              나가기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UnsavedChangesContext.Provider>
  )
}
