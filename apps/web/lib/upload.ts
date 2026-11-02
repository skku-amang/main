import type { MutableRefObject } from "react"

/** presigned URL로 파일을 PUT하며 진행률을 알린다. 취소는 xhrRef.current.abort() */
export function putFileWithProgress(
  uploadUrl: string,
  file: File,
  opts: {
    onProgress: (percent: number) => void
    xhrRef: MutableRefObject<XMLHttpRequest | null>
  }
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    opts.xhrRef.current = xhr

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        opts.onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error("Upload failed"))
    })
    xhr.addEventListener("error", () => reject(new Error("Upload failed")))
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")))
    xhr.open("PUT", uploadUrl)
    xhr.setRequestHeader("Content-Type", file.type)
    xhr.send(file)
  })
}
