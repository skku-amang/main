import SearchBar from "../SearchBar"

export const SearchBarSlide = {
  key: "searchbar",
  title: "SearchBar",
  content: (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold"># SearchBar</h2>
        <p className="text-sm text-muted-foreground">
          size variants (xs / sm / md / lg) + width is controlled by parent.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border bg-white p-6 space-y-3">
          <div className="text-sm font-medium text-muted-foreground">xs</div>
          <SearchBar size="xs" className="w-64" />
          <SearchBar size="xs" className="w-80" />
          <SearchBar size="xs" className="w-full max-w-md" />
        </div>

        <div className="rounded-xl border bg-white p-6 space-y-3">
          <div className="text-sm font-medium text-muted-foreground">sm</div>
          <SearchBar size="sm" className="w-64" />
          <SearchBar size="sm" className="w-80" />
          <SearchBar size="sm" className="w-full max-w-md" />
        </div>

        <div className="rounded-xl border bg-white p-6 space-y-3">
          <div className="text-sm font-medium text-muted-foreground">md</div>
          <SearchBar size="md" className="w-64" />
          <SearchBar size="md" className="w-80" />
          <SearchBar size="md" className="w-full max-w-md" />
        </div>

        <div className="rounded-xl border bg-white p-6 space-y-3">
          <div className="text-sm font-medium text-muted-foreground">lg</div>
          <SearchBar size="lg" className="w-64" />
          <SearchBar size="lg" className="w-80" />
          <SearchBar size="lg" className="w-full max-w-md" />
        </div>
      </div>
    </section>
  )
}
