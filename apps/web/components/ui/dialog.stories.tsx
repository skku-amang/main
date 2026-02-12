import type { Meta, StoryObj } from "@storybook/react"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import { Button } from "./button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./dialog"

const meta: Meta = {
  title: "ui/Dialog",
  tags: ["autodocs"]
}

export default meta
type Story = StoryObj

export const Basic: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a basic dialog description.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">취소</Button>
          <Button>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const Success: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <DialogTitle>정말로 지원하시겠습니까?</DialogTitle>
          </div>
          <DialogDescription>
            이미 신청한 팀이 있으면 팀장에게 알려야 할 수도 있습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">취소</Button>
          <Button>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const Alert: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <DialogTitle>세션 지원이 취소되었습니다</DialogTitle>
          </div>
          <DialogDescription>이 작업은 되돌릴 수 없습니다.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">취소</Button>
          <Button variant="destructive">확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
