// Dropdown.slide.tsx
import Dropdown from "../Dropdown"

export const DropdownSlide = {
  key: "dropdown",
  title: "Dropdown",
  content: (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold"># Dropdown</h2>
        <p className="text-sm text-muted-foreground">
          size variants (xs / sm / md / lg) + width is controlled by parent.
        </p>
      </div>

      <div className="space-y-4">
        {(["xs", "sm", "md", "lg"] as const).map((size) => (
          <div key={size} className="rounded-xl border bg-white p-6 space-y-4">
            <div className="text-sm font-medium text-muted-foreground">
              {size}
            </div>

            <div className="grid gap-6">
              <div className="space-y-3">
                <div className="text-sm font-semibold text-slate-900">Menu</div>
                <Dropdown
                  size={size}
                  className="w-80"
                  placeholder="Select"
                  options={[
                    { value: "regular", label: "2024-1 정기공연" },
                    { value: "festival", label: "2024-1 대동제" },
                    { value: "vacation", label: "2024-1 방학공연" },
                    { value: "special", label: "2024-1 특별공연" }
                  ]}
                />
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-slate-900">
                  User menu
                </div>
                <Dropdown
                  size={size}
                  variant="user"
                  className="w-80"
                  placeholder="Select"
                  options={[
                    {
                      value: "u1",
                      name: "30기 김수연",
                      tag: "#가나다라마바사",
                      imageSrc: "https://github.com/shadcn.png",
                      imageAlt: "@shadcn"
                    },
                    {
                      value: "u2",
                      name: "29기 박진우",
                      tag: "#아자",
                      imageSrc: "https://github.com/shadcn.png",
                      imageAlt: "@shadcn"
                    },
                    {
                      value: "u3",
                      name: "33기 김영주",
                      tag: "#차카",
                      imageSrc: "https://github.com/shadcn.png",
                      imageAlt: "@shadcn"
                    },
                    {
                      value: "u4",
                      name: "33기 손장수",
                      tag: "#타파",
                      imageSrc: "https://github.com/shadcn.png",
                      imageAlt: "@shadcn"
                    }
                  ]}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
