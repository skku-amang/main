import Avatar from "../Avatar"

export const AvatarSlide = {
  key: "avatar",
  title: "Avatar",
  content: (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold"># Avatar</h2>
        <p className="text-sm text-muted-foreground">
          size variants (xs / sm / md / lg) · name never truncates · colored
          shadcn avatar
        </p>
      </div>

      <div className="space-y-4">
        {["xs", "sm", "md", "lg"].map((size) => (
          <div key={size} className="rounded-xl border bg-white p-6 space-y-3">
            <div className="text-sm font-medium text-muted-foreground">
              {size}
            </div>

            <Avatar
              size={size as any}
              className="w-56"
              name="31기 오정환"
              timeLabel="2 days ago"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
