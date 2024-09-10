import { SignupForm } from '@/components/SignupForm'

const Signup = () => {
  return (
    <div className="container min-w-[160px] max-w-[400px] px-0 py-20">
      <h1 className="mb-10 text-lg font-bold">회원가입</h1>
      <SignupForm></SignupForm>
    </div>
  )
}

export default Signup
