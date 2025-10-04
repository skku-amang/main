import AvatarCustomed from "./_components/AvatarCustomed"
import BadgeCustomed from "./_components/BadgeCustomed"
import BreadcumbCustomed from "./_components/BreadcumbCustomed"
import CardCustomed from "./_components/CardCustomed"
import CheckboxCustomed from "./_components/CheckboxCustomed"
import HeaderCustomed from "./_components/Header"
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
        <CardCustomed className="p-12">
          동해물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세 무궁화
          삼천리 화려강산 대한사람 대한으로 길이 보전하세 동해물과 백두산이
          마르고 닳도록 하느님이 보우하사 우리나라 만세 무궁화 삼천리 화려강산
          대한사람 대한으로 길이 보전하세 동해물과 백두산이 마르고 닳도록
          하느님이 보우하사 우리나라 만세 무궁화 삼천리 화려강산 대한사람
          대한으로 길이 보전하세 동해물과 백두산이 마르고 닳도록 하느님이
          보우하사 우리나라 만세 무궁화 삼천리 화려강산 대한사람 대한으로 길이
          보전하세
        </CardCustomed>
      </div>

      {/* Checkbox */}
      <div>
        <h1 className="text-xl font-semibold mb-16"># Checkbox</h1>
        <CheckboxCustomed label="Checkbox Label" />
      </div>

      {/* Dropdown */}
      <div>
        <h1 className="text-xl font-semibold mb-16"># Dropdown</h1>
        <span>
          이건 Input Area 컴포넌트의 Select랑 같은거 같아서 일단 보류해 놓을게용
        </span>
      </div>

      {/* Header */}
      <div className="w-full h-auto">
        <h1 className="text-xl font-semibold mb-16"># Header</h1>
        <HeaderCustomed
          heightClassName="h-[250px] md:h-[400px]"
          paddingTop="pt-[40px] md:pt-[80px]"
          title="Join Your Team"
          goBackHref="/test"
        />
      </div>

      {/* SearchBar */}
      <div>
        <h1 className="text-xl font-semibold mb-16"># SearchBar</h1>
        <SearchBarCustomed />
      </div>
    </div>
  )
}
