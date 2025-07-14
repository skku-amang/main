import React from "react"

import DescribeToJSX from "@/components/DescribeToJSX"

interface Props {
  params: Promise<{
    id: number
  }>
}

const MemberDetail = async (props: Props) => {
  const params = await props.params
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
