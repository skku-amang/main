import Dropdown from "../Dropdown"

const AVATAR = "https://github.com/shadcn.png"

export const DropdownSlide = {
  key: "dropdown",
  title: "Dropdown",
  content: (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold"># Dropdown</h2>
        <p className="text-sm text-muted-foreground">
          Two variants: user list dropdown + normal menu dropdown. Uses a right
          scrollbar (no up/down chevrons) when content overflows.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border bg-white p-6 space-y-3">
          <div className="text-sm font-medium text-muted-foreground">
            User menu
          </div>

          <Dropdown
            variant="user"
            className="max-w-md"
            placeholder="Select"
            maxContentHeight={240}
            options={[
              {
                value: "u1",
                name: "30기 김수연",
                tag: "#가나다라마바사",
                imageSrc: AVATAR
              },
              {
                value: "u2",
                name: "29기 박진우",
                tag: "#아자",
                imageSrc: AVATAR
              },
              {
                value: "u3",
                name: "33기 김영주",
                tag: "#차카",
                imageSrc: AVATAR
              },
              {
                value: "u4",
                name: "33기 손장수",
                tag: "#티파",
                imageSrc: AVATAR
              },
              {
                value: "u5",
                name: "32기 권태환",
                tag: "#하하하",
                imageSrc: AVATAR
              },
              {
                value: "u6",
                name: "34기 홍길동",
                tag: "#추가1",
                imageSrc: AVATAR
              },
              {
                value: "u7",
                name: "35기 임꺽정",
                tag: "#추가2",
                imageSrc: AVATAR
              },
              {
                value: "u8",
                name: "36기 성춘향",
                tag: "#추가3",
                imageSrc: AVATAR
              },
              {
                value: "u9",
                name: "37기 이몽룡",
                tag: "#추가4",
                imageSrc: AVATAR
              }
            ]}
          />
        </div>

        <div className="rounded-xl border bg-white p-6 space-y-3">
          <div className="text-sm font-medium text-muted-foreground">Menu</div>

          <Dropdown
            variant="menu"
            className="max-w-xs"
            placeholder="Select"
            maxContentHeight={220}
            options={[
              { value: "a", label: "오름차순" },
              { value: "b", label: "내림차순" },
              { value: "c", label: "최신순" },
              { value: "d", label: "오래된순" },
              { value: "e", label: "정렬해제" },
              { value: "f", label: "추가 옵션 1" },
              { value: "g", label: "추가 옵션 2" },
              { value: "h", label: "추가 옵션 3" },
              { value: "i", label: "추가 옵션 4" }
            ]}
          />
        </div>
      </div>
    </section>
  )
}
