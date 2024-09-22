"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Poppins } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import { signIn } from "next-auth/react"
import React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ROUTES from "@/constants/routes"
import { emailSchema, passwordSchema } from "@/constants/zodSchema"
import { cn } from "@/lib/utils"

const Poppin = Poppins({ subsets: ['latin'], weight: '400' })

const formSchema = z.object({
  email: emailSchema,
  password: passwordSchema
})

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema) })

  async function onValid(formData: z.infer<typeof formSchema>) {
    await signIn("credentials", formData)
  }

  return (
    <div className="flex h-full w-full items-center justify-center md:mt-3 mb-16">
      <div className="flex flex-col items-center justify-center lg:relative xl:w-[70rem] lg:w-[60rem] h-[653px] rounded-lg bg-white lg:shadow-xl">
          <Image width="680" height="753" className="hidden lg:block lg:absolute xl:scale-x-100 lg:scale-x-90 xl:-left-3 lg:-left-9 lg:top-0" src="/loginwave.svg" alt="Icon"/>
          <div className="hidden lg:block lg:absolute lg:left-16 lg:top-36">
            <div className="font-bold text-5xl text-white mb-7">
              Welcome to <br/>Amang
            </div>
            <div className="text-white">
              Please log in to get started<br/>Log in and join the rhythm
            </div>
          </div>
          <div className="lg:absolute lg:top-[8.5rem] lg:right-20 xl:right-32 flex flex-col justify-center items-center">
            <h3 className={cn(Poppin.className, 'mb-1 text-slate-900 text-2xl font-black')}>Sign In</h3>
            <h5 className={cn(Poppin.className, 'text-base text-slate-500 mb-8')}>Let&apos;s build something great</h5>
            {/* 일반 로그인 */}
            <form className="flex flex-col items-center" onSubmit={handleSubmit(onValid)}>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="email" className="font-semibold">ID</Label>
                  <Input    
                    {...register("email")}
                    name="email"
                    placeholder="Input text"
                    className=" h-12 border-slate-300 shadow-sm bg-white px-7 text-xl lg:w-80"/>
                </div>             
                <div className="text-destructive mb-6">{errors.email?.message}</div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="password" className="font-semibold">PassWord</Label>
                  <Input
                    {...register("password")}
                    name="password"
                    placeholder="Input text"
                    type="password"
                    className=" h-12 border-slate-300 shadow-sm bg-white px-7 text-xl lg:w-80 mt-1"/>
                </div>
                <div className="text-destructive">{errors.password?.message}</div>
                <Button
                  type="submit"
                  className="h-12 w-72 bg-blue-500 text-base font-semibold mt-8"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Login on Progress..." : "Login"}
                </Button>
                <div className={cn(Poppin.className, "flex justify-center pt-5")}>
                <div className="pr-2">
                  Don&apos;t have an account?
                </div>
                  <Link href={ROUTES.SIGNUP.url} className={cn(Poppin.className, "text-blue-400")}>
                    Sign up
                  </Link>
                </div>
                <div className={cn(Poppin.className, "text-blue-400 pt-6")}>Forgot Password?</div>
            </form>
          </div>
      </div>
    </div>
  )
}

export default Login
