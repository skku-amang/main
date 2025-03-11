import SignupForm from "@/app/(general)/(light)/signup/_components/SignupForm"
import API_ENDPOINTS from "@/constants/apiEndpoints"
import fetchData from "@/lib/fetch"

const Signup = async () => {
  const sessionRes = await fetchData(API_ENDPOINTS.SESSION.LIST, {
    cache: "no-cache"
  })
  const sessions = await sessionRes.json()

  const generationRes = await fetchData(API_ENDPOINTS.GENERATION.LIST, {
    cache: "no-cache"
  })
  const generations = await generationRes.json()

  return (
    <div className="flex h-full w-full items-center justify-center lg:py-20">
      <div className="flex h-full overflow-hidden rounded-xl bg-white lg:w-[1156px] lg:shadow-2xl xl:w-[1536px]">
        <div
          className="hidden h-auto min-h-full w-full lg:block"
          style={{
            backgroundImage: `url('/gradients.svg')`,
            backgroundPosition: "top",
            backgroundSize: "cover"
          }}
        ></div>
        <SignupForm sessions={sessions} generations={generations} />
      </div>
    </div>
  )
}

export default Signup
