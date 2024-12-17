import { zodResolver } from "@hookform/resolvers/zod"
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
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import YoutubeVideo from "@/lib/youtube"
import YoutubePlayer from "@/lib/youtube/Player"

import basicInfoSchema, { songYoutubeVideoIdSchema } from "./schema"

interface YoutubeDialog {
  form: ReturnType<typeof useForm<z.infer<typeof basicInfoSchema>>>
  fieldName: keyof z.infer<typeof basicInfoSchema>
}

const YoutubeDialog = ({ form, fieldName }: YoutubeDialog) => {
  const [open, setOpen] = useState(false)

  const innerSchema = z.object({
    songYoutubeVideoId: songYoutubeVideoIdSchema
  })
  const innerForm = useForm<z.infer<typeof innerSchema>>({
    resolver: zodResolver(innerSchema),
    defaultValues: {
      songYoutubeVideoId: YoutubeVideo.getURL(
        form.getValues(fieldName) as string
      )
    }
  })

  function onInnerFormValid(formData: any) {
    form.clearErrors("songYoutubeVideoId")
    form.setValue(
      "songYoutubeVideoId",
      formData.songYoutubeVideoId
    )
    !form.formState.errors.songYoutubeVideoId && setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          asChild
          variant={
            form.formState.errors.songYoutubeVideoId?.message
              ? "destructive"
              : "outline"
          }
          type="button"
          className={cn(
            "border border-secondary text-secondary hover:text-white hover:bg-secondary",
            form.formState.errors.songYoutubeVideoId?.message &&
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

          <p className="mb-4 text-sm text-zinc-500">유튜브 링크를 업로드하여 주세요.</p>
          <Form {...innerForm}>
            <form
              onSubmit={innerForm.handleSubmit(onInnerFormValid, (e) =>
                console.error(e)
              )}
            >
              <div className="flex items-center gap-x-3">
                <Input
                  {...innerForm.register("songYoutubeVideoId")}
                  className={cn(
                    innerForm.formState.errors["songYoutubeVideoId"]?.message &&
                      "border-destructive"
                  )}
                  placeholder="Enter URL"
                />
                <Button
                  type="submit"
                  className="bg-secondary"
                  disabled={!!innerForm.formState.errors.songYoutubeVideoId}
                >
                  Upload
                </Button>
              </div>
              {innerForm.formState.errors.songYoutubeVideoId && (
                <div className="mt-1 text-xs text-destructive">
                  {innerForm.formState.errors.songYoutubeVideoId.message}
                </div>
              )}
            </form>
          </Form>
          {innerForm.getValues("songYoutubeVideoId") &&
            YoutubeVideo.getValidVideoIdOrNull(
              innerForm.getValues("songYoutubeVideoId")
            ) && (
              <div className="aspect-video overflow-visible">
                <YoutubePlayer
                  videoId={YoutubeVideo.getVideoId(
                    innerForm.getValues("songYoutubeVideoId")
                  )}
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
