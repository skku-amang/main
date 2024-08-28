'use server'
import { auth, signIn, signOut } from '@/auth'

export const signInWithCredentials = async (formData: any) => {
  await signIn('credentials', formData)
}
export const signInWithGoogle = async () => {
  await signIn('google')
}
export const signOutWithForm = async () => {
  await signOut({ redirectTo: '/' }) // NextJs 14.2 버그로 작동 안됨
}
export { auth as getSession }
