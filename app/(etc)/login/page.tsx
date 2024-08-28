'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { emailSchema, passwordSchema } from '@/constants/zodSchema'
// import { FcGoogle } from 'react-icons/fc'
import { signInWithCredentials } from '@/serverActions/auth'

import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
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
    await signInWithCredentials(formData)
  }

  return (
    <div className="flex justify-center">
      <div className="mb-[60px] mt-[50px] flex h-[698px] w-[1152px] items-center justify-center gap-[100px] rounded-[15px] bg-white">
        <div
          className={`h-[644px] w-[490px] rounded-[50px] ${styles.gradation}`}
        ></div>
        <div className="mb-[45px] ml-[30px] mr-[100px] flex flex-col items-center justify-center">
          <h3 className="mb-[30px] text-[35px] font-[600]">Login</h3>
          <div className="flex flex-col gap-[30px]">
            {/* 일반 로그인 */}
            <form onSubmit={handleSubmit(onValid)} className="space-y-4">
              <Input
                {...register('email', { required: '이메일을 입력해주세요' })}
                name="email"
                placeholder="Email"
                className="h-[50px] w-[330px] rounded-[50px]"
              />
              <div className="text-destructive">{errors.email?.message}</div>
              <Input
                {...register('password', {
                  required: '비밀번호를 입력해주세요'
                })}
                name="password"
                placeholder="PW"
                type="password"
                className="h-[50px] w-[330px] rounded-[50px]"
              />
              <div className="text-destructive">{errors.password?.message}</div>

              <Button
                type="submit"
                className="w-full rounded-3xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? '로그인 중...' : '로그인'}
              </Button>
            </form>

            {/* 구글 */}
            {/* <form
              action={async () => {
                'use server'
                await signIn('google')
              }}
            >
              <button type="submit">
                <FcGoogle size={50} />
              </button>
            </form> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
