import Video from "../Video"

const SIZE_WIDTH: Record<"xs" | "sm" | "md" | "lg", string> = {
  xs: "max-w-sm",
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl"
}

export const VideoSlide = {
  key: "video",
  title: "Video",
  content: (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold"># Video</h2>
        <p className="text-sm text-muted-foreground">
          size variants (xs / sm / md / lg) + width is controlled by parent or
          className.
        </p>
      </div>

      <div className="space-y-4">
        {(["xs", "sm", "md", "lg"] as const).map((size) => (
          <div key={size} className="rounded-xl border bg-white p-6 space-y-3">
            <div className="text-sm font-medium text-muted-foreground">
              {size}
            </div>

            <Video
              size={size}
              youtubeUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              className={`w-full ${SIZE_WIDTH[size]}`}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
