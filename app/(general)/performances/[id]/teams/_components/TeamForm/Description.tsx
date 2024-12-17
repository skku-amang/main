import React from "react"

interface DescriptionProps {
  header: React.ReactNode
  children?: React.ReactNode
  className?: string
}

const Description = ({ header, children, className }: DescriptionProps) => {
  return (
    <div className={className}>
      <h2 className="mb-2 text-md md:text-lg font-extrabold">{header}</h2>
      <div className="flex items-center gap-x-2 text-xs text-gray-500">
        {children}
      </div>
    </div>
  )
}

export default Description
