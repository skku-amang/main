import Markdown from "react-markdown"

/** 업데이트 본문 md — 사진은 화면 폭에 맞추고 가까워질 때 불러온다 */
export default function UpdateBody({ body }: { body: string }) {
  return (
    <Markdown
      components={{
        p: (props) => <p className="leading-relaxed" {...props} />,
        ul: (props) => <ul className="list-disc space-y-1 pl-5" {...props} />,
        ol: (props) => (
          <ol className="list-decimal space-y-1 pl-5" {...props} />
        ),
        a: ({ children, ...props }) => (
          <a className="text-primary underline underline-offset-2" {...props}>
            {children}
          </a>
        ),
        img: ({ alt, ...props }) => (
          // 글마다 크기가 다른 정적 사진이라 next/image 대신 그대로 둔다
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={alt ?? ""}
            loading="lazy"
            className="mx-auto h-auto max-w-full rounded-lg border"
            {...props}
          />
        )
      }}
    >
      {body}
    </Markdown>
  )
}
