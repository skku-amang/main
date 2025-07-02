import { zodResolver } from "@hookform/resolvers/zod"
import { Youtube } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { cn } from "@/lib/utils"
import YoutubePlayer from "@/lib/youtube/Player"
import { Button } from "@repo/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@repo/ui/dialog"
import { Form } from "@repo/ui/form"
import { Input } from "@repo/ui/input"

import basicInfoSchema, { songYoutubeVideoUrlSchema } from "./schema"

interface YoutubeDialogProps {
  form: ReturnType<typeof useForm<z.infer<typeof basicInfoSchema>>>
  fieldName: keyof z.infer<typeof basicInfoSchema>
}

const YoutubeDialog = ({ form, fieldName }: YoutubeDialogProps) => {
  const [open, setOpen] = useState(false)

  const innerSchema = z.object({
    songYoutubeVideoUrl: songYoutubeVideoUrlSchema
  })
  const innerForm = useForm<z.infer<typeof innerSchema>>({
    resolver: zodResolver(innerSchema),
    defaultValues: {
      songYoutubeVideoUrl: form.getValues(fieldName) as string
    }
  })

  function onInnerFormValid(formData: any) {
    form.clearErrors("songYoutubeVideoUrl")
    form.setValue("songYoutubeVideoUrl", formData.songYoutubeVideoUrl)
    !form.formState.errors.songYoutubeVideoUrl && setOpen(false)
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
      <DialogContent aria-describedby={undefined} className="rounded-xl">
        <div className="rounded-xl">
          <DialogHeader className="mb-1">
            <DialogTitle className="text-slate-900">Youtube Embed</DialogTitle>
          </DialogHeader>

          <p className="mb-4 text-sm text-zinc-500">
            유튜브 링크를 업로드하여 주세요.
          </p>
          <Form {...innerForm}>
            <form
              onSubmit={innerForm.handleSubmit(onInnerFormValid, (e) =>
                console.error(e)
              )}
            >
              <div className="flex items-center gap-x-3">
                <Input
                  {...innerForm.register("songYoutubeVideoUrl")}
                  className={cn(
                    innerForm.formState.errors["songYoutubeVideoUrl"]
                      ?.message && "border-destructive"
                  )}
                  placeholder="Enter URL"
                />
                <Button
                  type="submit"
                  className="bg-secondary"
                  disabled={!!innerForm.formState.errors.songYoutubeVideoUrl}
                >
                  Upload
                </Button>
              </div>
              {innerForm.formState.errors.songYoutubeVideoUrl && (
                <div className="mt-1 text-xs text-destructive">
                  {innerForm.formState.errors.songYoutubeVideoUrl.message}
                </div>
              )}
            </form>
          </Form>
          {innerForm.getValues("songYoutubeVideoUrl") && (
            <div className="aspect-video overflow-visible">
              <YoutubePlayer
                videoUrl={innerForm.getValues("songYoutubeVideoUrl")}
                className="mt-4 h-full w-full"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default YoutubeDialog
