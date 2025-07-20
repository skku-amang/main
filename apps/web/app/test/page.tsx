import SearchBar from "./_components/SearchBar"

// apps/web/app/test/page.tsx
export default function TestPage() {
  return (
    <div className="p-10">
      <h1 className="text-2xl pb-7 font-bold">UI 테스트 페이지</h1>

      {/* SearchBar */}
      <h2># SearchBar</h2>
      <SearchBar />
    </div>
  )
}
