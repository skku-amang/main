import Toast from "../Toast"

export const ToastSlide = {
  key: "toast",
  title: "Toast",
  content: (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold"># Toast</h2>
        <p className="text-sm text-muted-foreground">
          size variants (xs / sm / md / lg) + width is controlled by parent or
          className.
        </p>
      </div>

      <div className="space-y-6">
        {(["xs", "sm", "md", "lg"] as const).map((size) => (
          <div key={size} className="rounded-xl border bg-white p-6 space-y-4">
            <div className="text-sm font-medium text-muted-foreground">
              {size}
            </div>

            <div className="space-y-3">
              <Toast
                size={size}
                tone="positive"
                title="축하합니다!"
                description="회원가입이 성공적으로 완료되었습니다"
              />
              <Toast
                size={size}
                tone="negative"
                title="회원가입을 완료할 수 없습니다"
                description="비밀번호 확인을 완료해주세요"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
