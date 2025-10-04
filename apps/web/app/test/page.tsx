import AvatarInfo from "./_components/Avatar"
import SearchBar from "./_components/SearchBar"

// apps/web/app/test/page.tsx
export default function TestPage() {
  return (
    <div className="p-10 flex flex-col gap-10">
      <h1 className="text-2xl pb-7 font-bold">UI 테스트 페이지</h1>

      {/* Avatar */}
      <div>
        <h2># Avartar</h2>
        <AvatarInfo
          generation={31}
          name="오정환"
          time={new Date("2025-09-28T21:00:00Z")}
        />
      </div>
      {/* SearchBar */}
      <div>
        <h2># SearchBar</h2>
        <SearchBar />
      </div>
    </div>
  )
}
