import { Youtube } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

import basicInfoSchema from "./schema"
import YoutubeInput from "./YoutubeInput"

interface YoutubeDialogProps {
  form: ReturnType<typeof useForm<z.infer<typeof basicInfoSchema>>>
  fieldName: keyof z.infer<typeof basicInfoSchema>
}

const YoutubeDialog = ({ form, fieldName }: YoutubeDialogProps) => {
  const [open, setOpen] = useState(false)

  function handleConfirm(url: string) {
    form.clearErrors("songYoutubeVideoUrl")
    form.setValue("songYoutubeVideoUrl", url)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          asChild
          variant={
            form.formState.errors.songYoutubeVideoUrl?.message
              ? "destructive"
              : "outline"
          }
          type="button"
          className={cn(
            "border border-secondary text-secondary hover:bg-secondary hover:text-white",
            form.formState.errors.songYoutubeVideoUrl?.message &&
              "border-destructive bg-destructive"
          )}
          onClick={() => setOpen(true)}
        >
          <div className="flex items-center justify-center gap-x-2.5">
            <Youtube size={24} />
            Youtube Embed
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} className="rounded-2xl">
        <div className="rounded-xl">
          <DialogHeader className="mb-1">
            <DialogTitle className="text-slate-900">Youtube Embed</DialogTitle>
          </DialogHeader>

          <p className="mb-4 text-sm text-zinc-500">
            유튜브 링크를 업로드하여 주세요.
          </p>
          <YoutubeInput
            defaultUrl={(form.getValues(fieldName) as string) || ""}
            onConfirm={handleConfirm}
            showLinkIcon
            playerClassName="mt-4 h-full aspect-video"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default YoutubeDialog
