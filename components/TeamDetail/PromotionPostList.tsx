import { createUser } from '../../lib/dummy/User'
import { User } from '../../types/User'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'

const PromotionPost = ({ title, content, author }: { title: string; content: string; author: User }) => {
  return (
    <Card className='p-4 hover:bg-slate-100 hover:cursor-pointer transition ease-in-out duration-300 space-y-1'>
      <CardHeader className='p-0'>
        <CardTitle className='text-md'>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm p-0">{content}</CardContent>
      <CardFooter className='p-0'>
        <div className="text-sm text-right text-slate-400">작성자: {author.name}</div>
      </CardFooter>
    </Card>
  )
}

const PromotionPostList = () => {
  const promotionPosts: { id: number; title: string; content: string; author: User }[] = [
    {
      id: 0,
      title: '팀원 모집합니다!',
      content: '저희 팀은 2021년 1학기에 새로운 팀원을 모집합니다. 관심 있으신 분들은 연락주세요!',
      author: createUser(1)
    },
    {
      id: 1,
      title: '팀원 모집합니다!',
      content: '저희 팀은 2021년 1학기에 새로운 팀원을 모집합니다. 관심 있으신 분들은 연락주세요!',
      author: createUser(2)
    },
    {
      id: 2,
      title: '팀원 모집합니다!',
      content: '저희 팀은 2021년 1학기에 새로운 팀원을 모집합니다. 관심 있으신 분들은 연락주세요!',
      author: createUser(3)
    },
    {
      id: 3,
      title: '팀원 모집합니다!',
      content: '저희 팀은 2021년 1학기에 새로운 팀원을 모집합니다. 관심 있으신 분들은 연락주세요!',
      author: createUser(4)
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>홍보글 목록</CardTitle>
      </CardHeader>
      <CardContent className="divide-y">
        <div className="divide-y overflow-hidden rounded-lg space-y-2">
          {promotionPosts.map((post) => (
            <PromotionPost key={post.id} title={post.title} content={post.content} author={post.author} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default PromotionPostList
