"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Oleo_Script, Poppins } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { useToast } from "@/components/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ROUTES from "@/constants/routes"
import { signInSchema } from "@/constants/zodSchema"
import { InvalidSigninErrorCode } from "@/lib/auth/errors"
import { cn } from "@/lib/utils"

const OleoScript = Oleo_Script({ subsets: ["latin"], weight: "400" })

const Poppin = Poppins({ subsets: ["latin"], weight: "400" })

const Login = () => {
  const router = useRouter()
  const { toast } = useToast()

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
        break

      default:
        toast({
          title: "로그인 실패",
          description: "알 수 없는 에러 발생!",
          variant: "destructive"
        })
    }
  }

  return (
    <div className="mb-16 flex h-full w-full items-center justify-center">
      <div className="flex h-[653px] flex-col items-center justify-center overflow-hidden rounded-2xl bg-white lg:relative lg:w-[60rem] lg:shadow-2xl xl:w-[70rem]">
        <Image
          width="680"
          height="753"
          className="hidden lg:absolute lg:-left-9 lg:top-0 lg:block lg:scale-x-90 xl:-left-3 xl:scale-x-100"
          src="/loginwave.svg"
          alt="Icon"
        />
        <div className="hidden lg:absolute lg:left-16 lg:top-28 lg:block">
          <div className="flex flex-col">
            <div
              className={cn(
                OleoScript.className,
                "h-20 text-[4.8rem] font-bold text-white"
              )}
            >
              Welcome to
            </div>
            <div
              className={cn(
                OleoScript.className,
                " text-[4.8rem] font-bold text-white"
              )}
            >
              Amang
            </div>
          </div>
          <div className="font-semibold text-white">
            Please log in to get started
            <br />
            Log in and join the rhythm
          </div>
        </div>
        <div className="flex flex-col items-center justify-center lg:absolute lg:right-20 lg:top-[8.5rem] xl:right-32">
          <h3
            className={cn(
              Poppin.className,
              "mb-2 text-2xl font-black text-slate-900"
            )}
          >
            로그인
          </h3>
          <h5
            className={cn(
              Poppin.className,
              "mb-8 text-sm font-black text-slate-500"
            )}
          >
            계속하려면 로그인해주세요
          </h5>
          {/* 일반 로그인 */}
          <form
            className="flex flex-col items-center"
            onSubmit={handleSubmit(onValid)}
          >
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="email" className="font-semibold">
                아이디
              </Label>
              <Input
                {...register("email")}
                name="email"
                placeholder="Input text"
                className=" h-12 border-slate-300 bg-white px-7 text-xl shadow-sm lg:w-80"
              />
            </div>
            <div className="mb-6 text-destructive">{errors.email?.message}</div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="password" className="font-semibold">
                비밀번호
              </Label>
              <Input
                {...register("password")}
                name="password"
                placeholder="Input text"
                type="password"
                className=" mt-1 h-12 border-slate-300 bg-white px-7 text-xl shadow-sm lg:w-80"
              />
            </div>
            <div className="text-destructive">{errors.password?.message}</div>
            <Button
              type="submit"
              className="mt-8 h-12 w-72 bg-third text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Login on Progress..." : "로그인"}
            </Button>
            <div className={cn(Poppin.className, "flex justify-center pt-4")}>
              <div className="pr-2 text-sm font-extrabold text-slate-900">
                아직 계정이 없으신가요?
              </div>
              <Link
                href={ROUTES.SIGNUP.url}
                className={cn(Poppin.className, "text-sm text-blue-400")}
              >
                회원가입
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
