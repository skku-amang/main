import Card from "../Card"

export const CardSlide = {
  key: "card",
  title: "Card",
  content: (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold"># Card</h2>
        <p className="text-sm text-muted-foreground">
          single variant · fixed sharp accent · width controlled by parent or
          classname.
        </p>
      </div>

      <div className="space-y-4">
        <Card className="w-full max-w-xl">
          <div className="space-y-3">
            <div className="text-lg font-semibold">Title</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sharp tapered primary accent on the left side. This card example
              contains enough content to maintain a visually balanced height and
              clearly showcase the accent design.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Extremely short cards are intentionally excluded to avoid awkward
              proportions.
            </p>
          </div>
        </Card>
      </div>
    </section>
  )
}
