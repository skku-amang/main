import Checkbox from "../Checkbox"

export const CheckboxSlide = {
  key: "checkbox",
  title: "Checkbox",
  content: (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold"># Checkbox</h2>
        <p className="text-sm text-muted-foreground">
          size variants (xs / sm / md / lg) + width is controlled by parent or
          classname.
        </p>
      </div>

      <div className="space-y-4">
        {["xs", "sm", "md", "lg"].map((size) => (
          <div key={size} className="rounded-xl border bg-white p-6 space-y-4">
            <div className="text-sm font-medium text-muted-foreground">
              {size}
            </div>

            <div className="space-y-3">
              <Checkbox
                size={size as any}
                className="w-full max-w-md"
                label="Checkbox Label"
              />
              <Checkbox
                size={size as any}
                className="w-full max-w-md"
                label="Checkbox Label"
                defaultChecked
              />
              <Checkbox
                size={size as any}
                className="w-full max-w-md"
                label="Checkbox Label"
                disabled
              />
              <Checkbox
                size={size as any}
                className="w-full max-w-md"
                label="Checkbox Label"
                defaultChecked
                disabled
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
