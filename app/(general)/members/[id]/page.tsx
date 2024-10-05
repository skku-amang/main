import React from "react"

import DescribeToJSX from "@/components/DescribeToJSX"

interface Props {
  params: {
    id: number
  }
}

const MemberDetail = ({ params }: Props) => {
  const { id } = params
  const user = undefined // not implemented

  return (
    <div>
      <h2>Member ID: {id}</h2>
      <DescribeToJSX data={user} level={0} />
    </div>
  )
}

export default MemberDetail
