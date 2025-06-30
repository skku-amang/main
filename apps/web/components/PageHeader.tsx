import React from "react"

const PageHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <h2 className="my-10 text-2xl font-extrabold text-zinc-700 lg:mt-28 lg:text-4xl">
        {children}
      </h2>
    </div>
  )
}

export default PageHeader
