type RelativeTimeProps = {
  time: string
}

const RelativeTime = ({ time }: RelativeTimeProps) => {
  const date = new Date(time)

  if (isNaN(date.getTime())) {
    return <>{`유효하지 않은 날짜`}</>
  }

  const now = new Date()
  const diffTime = now.getTime() - date.getTime()

  const diffSeconds = Math.floor(diffTime / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSeconds < 60) {
    return <>{`방금`}</>
  } else if (diffMinutes < 60) {
    return <>{`${diffMinutes}분 전`}</>
  } else if (diffHours < 24) {
    return <>{`${diffHours}시간 전`}</>
  } else if (diffDays === 1) {
    return <>{`어제`}</>
  } else if (diffDays < 7) {
    return <>{`${diffDays}일 전`}</>
  } else if (diffDays < 30) {
    return <>{`${Math.floor(diffDays / 7)}주 전`}</>
  } else if (diffMonths < 12) {
    return <>{`${diffMonths}개월 전`}</>
  } else {
    return <>{`${diffYears}년 전`}</>
  }
}

export default RelativeTime
