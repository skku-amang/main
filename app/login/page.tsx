"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ROUTES from "@/constants/routes"
import { signInSchema } from "@/constants/zodSchema"
import { InvalidSigninErrorCode } from "@/lib/auth/errors"

import styles from "./login.module.css"

const Login = () => {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema)
  })

  async function onValid(formData: z.infer<typeof signInSchema>) {
    const res = await signIn("credentials", { ...formData, redirect: false })
    if (!res?.error) return router.push(ROUTES.HOME.url)

    switch (res.code) {
      case InvalidSigninErrorCode:
        setError("email", {
          type: "manual",
          message: "이메일 또는 비밀번호가 일치하지 않습니다."
        })
        setError("password", {
          type: "manual",
          message: "이메일 또는 비밀번호가 일치하지 않습니다."
        })
        return
    }
  }

  return (
    <div className="flex h-full min-h-full w-full items-center justify-center py-10">
      <div className="flex h-full items-center justify-center gap-0 rounded-lg bg-white px-0 md:px-20 md:shadow-2xl lg:w-8/12 lg:gap-16">
        <div
          className={`${styles.gradation} w-0 flex-shrink-0 rounded-3xl xl:h-[90%] xl:w-1/3 xl:flex-1`}
        ></div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <h3 className="mb-10 text-4xl font-[600]">Login</h3>
          <div className="flex flex-col">
            {/* 일반 로그인 */}
            <form onSubmit={handleSubmit(onValid)} className="space-y-6">
              <Input
                {...register("email")}
                name="email"
                placeholder="Email"
                className="text-gray50 h-14 rounded-full border-none bg-gray-100 px-7 text-xl lg:w-80"
              />
              <div className="text-destructive">{errors.email?.message}</div>
              <Input
                {...register("password")}
                name="password"
                placeholder="PW"
                type="password"
                className="text-gray50 h-14 rounded-full border-none bg-gray-100 px-7 text-xl lg:w-80"
              />
              <div className="text-destructive">{errors.password?.message}</div>

              <Button
                type="submit"
                className="h-14 w-full rounded-full text-2xl font-extrabold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "로그인 중..." : "로그인"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
