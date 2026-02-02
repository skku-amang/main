// Breadcumb.slide.tsx
import Breadcumb from "../Breadcumb"

export const BreadcumbSlide = {
  key: "breadcumb",
  title: "Breadcumb",
  content: (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold"># Breadcumb</h2>
        <p className="text-sm text-muted-foreground">
          size variants (xs / sm / md / lg) + width is controlled by parent.
        </p>
      </div>

      <div className="space-y-4">
        {["xs", "sm", "md", "lg"].map((size) => (
          <div key={size} className="rounded-xl border bg-white p-6 space-y-3">
            <div className="text-sm font-medium text-muted-foreground">
              {size}
            </div>

            <Breadcumb
              size={size as any}
              className="w-64"
              items={[
                { label: "모집", href: "/recruit" },
                { label: "2025-1 정기공연", href: "/recruit/2025-1" },
                { label: "공연팀 목록" }
              ]}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
