import React from 'react'
import { FcGoogle } from 'react-icons/fc'

import { signIn } from '@/../auth'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'

import styles from './login.module.css'

const Login = () => {
  return (
    <div className="flex justify-center">
      <div className="mb-[60px] mt-[50px] flex h-[698px] w-[1152px] items-center justify-center gap-[100px] rounded-[15px] bg-white">
        <div className={`h-[644px] w-[490px] rounded-[50px] ${styles.gradation}`}></div>
        <div className="mb-[45px] ml-[30px] mr-[100px] flex flex-col items-center justify-center">
          <h3 className="mb-[30px] text-[35px] font-[600]">Login</h3>
          <div className="flex flex-col gap-[30px]">
            {/* 일반 로그인 */}
            <form
              className='space-y-4'
              action={async (formData) => {
                'use server'
                await signIn('credentials', formData)
              }}
            >
              <Input name="email" placeholder="Email" className="h-[50px] w-[330px] rounded-[50px]" />
              <Input name="password" placeholder="PW" className="h-[50px] w-[330px] rounded-[50px]" />

              <Button type="submit" className='w-full rounded-3xl'>로그인</Button>
            </form>

            {/* 구글 */}
            <form
              action={async () => {
                'use server'
                await signIn('google')
              }}
            >
              <button type="submit">
                <FcGoogle size={50} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
