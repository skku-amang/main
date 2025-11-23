"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function OnboardPage() {
  const [nickname, setNickname] = useState("")
  const [generation, setGeneration] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/auth/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nickname, generation })
    })
    setLoading(false)
    if (res.ok) {
      router.push("/")
    } else {
      const data = await res.json()
      alert(data?.error || "Onboard failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={submit}
        className="w-full max-w-md p-8 bg-white rounded shadow"
      >
        <h2 className="text-xl font-semibold mb-4">추가 정보 입력</h2>
        <label className="block mb-2">
          <div className="text-sm mb-1">닉네임</div>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </label>
        <label className="block mb-4">
          <div className="text-sm mb-1">Generation (숫자)</div>
          <input
            value={generation}
            onChange={(e) => setGeneration(e.target.value)}
            type="number"
            className="w-full border px-3 py-2 rounded"
          />
        </label>
        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "처리중..." : "가입 완료"}
        </button>
      </form>
    </div>
  )
}
