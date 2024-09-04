'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { emailSchema, passwordSchema } from '@/constants/zodSchema'

// import { FcGoogle } from 'react-icons/fc'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import styles from './login.module.css'

const formSchema = z.object({
  email: emailSchema,
  password: passwordSchema
})

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })

  async function onValid(formData: z.infer<typeof formSchema>) {
    await signIn('credentials', formData)
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
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
                {...register('email', { required: '이메일을 입력해주세요' })}
                name="email"
                placeholder="Email"
                className="text-gray50 h-14 rounded-full border-none bg-gray-100 px-7 text-xl lg:w-80"
              />
              <div className="text-destructive">{errors.email?.message}</div>
              <Input
                {...register('password', {
                  required: '비밀번호를 입력해주세요'
                })}
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
                {isSubmitting ? '로그인 중...' : '로그인'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
