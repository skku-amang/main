"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { emailSchema, passwordSchema } from "@/constants/zodSchema"
import { Label } from "@/components/ui/label"

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
    <div className="flex h-full min-h-full w-full items-center justify-center mt-16 mb-16">
      <div className="relative xl:w-[70rem] lg:w-[60rem] h-[653px] items-center justify-center gap-0 rounded-lg bg-white px-0 md:px-20 md:shadow-2xl lg:gap-16">
        <div className="flex flex-1 items-center justify-center">
          <img className="absolute xl:scale-x-100 lg:scale-x-90 xl:-left-3 lg:-left-9 lg:top-0" src="/loginwave.svg" alt="Icon"/>
          <div className="absolute lg:top-24 lg:right-24 flex flex-col justify-center items-center">
            <h3 className="mb-3 text-slate-900 text-3xl font-medium">Sign In</h3>
            <h5 className="text-lg font-slate-500 mb-10">Let's build something great</h5>
            <div className="flex flex-col">
            {/* 일반 로그인 */}
              <form onSubmit={handleSubmit(onValid)} className="space-y-6">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="email">ID</Label>
                  <Input    
                    {...register("email")}
                    name="email"
                    placeholder="Email"
                    className="text-gray50 h-14 border-slate-300 bg-white px-7 text-xl lg:w-80"/>
                </div>             
                <div className="text-destructive">{errors.email?.message}</div>
                <div className="grid w-full max-w-sm items-center gap-1.5"></div>
                  <Label htmlFor="password">PassWord</Label>
                  <Input
                    {...register("password")}
                    name="password"
                    placeholder="PW"
                    type="password"
                    className="text-gray50 h-14 border-slate-300 bg-white px-7 text-xl lg:w-80"/>
                <div className="text-destructive">{errors.password?.message}</div>
                <Button
                  type="submit"
                  className="h-14 w-full bg-blue-500 text-2xl font-extrabold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Login on Progress..." : "Login"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
