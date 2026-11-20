"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

import ROUTES from "@/constants/routes"

import { CodeResetForm, TokenResetForm } from "./_components/PasswordResetForm"

const PasswordReset = () => {
  const token = useSearchParams().get("token")

  return (
    <div className="mx-auto w-full max-w-md py-8 md:py-16">
      <div className="md:rounded-xl md:bg-white md:p-8 md:shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          {token ? "새 비밀번호 정하기" : "비밀번호 찾기"}
        </h1>
        {token ? (
          <p className="mb-6 mt-2 text-sm text-slate-600">
            운영진이 보내 준 링크예요. 새 비밀번호를 정하면 다른 기기에서는
            로그아웃돼요.
          </p>
        ) : (
          <p className="mb-6 mt-2 text-sm text-slate-600">
            이메일을 인증한 회원은 메일로 받은 인증번호로 찾을 수 있어요.
            인증하지 않았다면 운영진에게 비밀번호 재설정 링크를 요청해주세요.
          </p>
        )}
        {token ? <TokenResetForm token={token} /> : <CodeResetForm />}
        <p className="mt-6 text-center text-sm">
          <Link
            href={ROUTES.LOGIN}
            className="font-semibold text-primary underline underline-offset-4"
          >
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  )
}

const PasswordResetPage = () => (
  <Suspense>
    <PasswordReset />
  </Suspense>
)

export default PasswordResetPage
