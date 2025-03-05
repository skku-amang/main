interface PerformanceDetailProp {
  params: Promise<{
    id: number
  }>
}

const PerformanceEdit = async (props: PerformanceDetailProp) => {
  const params = await props.params;
  const { id } = params

  return (
    <>
      {id} 공연 수정 및 삭제
    </>
  )
}

export default PerformanceEdit