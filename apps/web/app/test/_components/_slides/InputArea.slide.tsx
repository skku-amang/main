import InputArea from "../InputArea"

export const InputAreaSlide = {
  key: "input-area",
  title: "InputArea",
  content: (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold"># InputArea</h2>
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

            <div className="space-y-4">
              <InputArea
                size={size}
                className="w-full max-w-md"
                label="이름"
                required
                description="실명을 입력해주세요"
                placeholder="Input text"
              />

              <InputArea
                size={size}
                className="w-full max-w-md"
                label="이름"
                required
                description="실명을 입력해주세요"
                placeholder="Input text"
                state="error"
                errorMessage="This is for error message"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
