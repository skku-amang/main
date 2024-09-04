interface PerformanceDetailProp {
  params: {
    id: number
  }
}

const PerformanceEdit = ({ params }: PerformanceDetailProp) => {
  const { id } = params

  return (
    <>
      {id} 공연 수정 및 삭제
    </>
  )
}

export default PerformanceEdit