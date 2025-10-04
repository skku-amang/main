import AvatarCustomed from "./_components/AvatarCustomed"
import BadgeCustomed from "./_components/BadgeCustomed"
import BreadcumbCustomed from "./_components/BreadcumbCustomed"
import CardCustomed from "./_components/CardCustomed"
import SearchBarCustomed from "./_components/SearchBarCustomed"

// apps/web/app/test/page.tsx
export default function TestPage() {
  return (
    <div className="p-10 flex flex-col gap-32">
      {/* Avatar */}
      <div>
        <h1 className="text-xl font-semibold mb-16"># Avartar</h1>
        <AvatarCustomed
          generation={31}
          name="오정환"
          time={new Date("2025-09-28T21:00:00Z")}
        />
      </div>

      {/* Badge */}
      <div>
        <h1 className="text-xl font-semibold mb-16">
          # Badge (추후 업데이트ㅜㅜ)
        </h1>
        <BadgeCustomed />
      </div>

      {/* Breadcumb */}
      <div>
        <h1 className="text-xl font-semibold mb-16"># Breadcumb</h1>
        <BreadcumbCustomed
          indexList={["모집", "2025-1 정기공연", "공연팀 목록"]}
        />
      </div>

      {/* Button */}
      <div>
        <h1 className="text-xl font-semibold mb-16">
          # Button (추후 업데이트ㅜㅜ)
        </h1>
        <BadgeCustomed />
      </div>

      {/* Calendar */}
      <div>
        <h1 className="text-xl font-semibold mb-16">
          # Calendar (추후 업데이트ㅜㅜ)
        </h1>
        <BadgeCustomed />
      </div>

      {/* Card */}
      <div>
        <h1 className="text-xl font-semibold mb-16"># Card</h1>
        <CardCustomed className="p-24">안녕하세요</CardCustomed>
      </div>

      {/* SearchBar */}
      <div>
        <h1 className="text-xl font-semibold mb-16"># SearchBar</h1>
        <SearchBarCustomed />
      </div>
    </div>
  )
}
