import Link from "next/link"

import { Button } from "../../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"

import ROUTES from "../../../constants/routes"
import { User } from "../../../types/User"

const NoticeCard = ({ title, author, createdDatetime }: { title: string, author: User, createdDatetime: Date}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{author.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>{createdDatetime.toString()}</p>
      </CardFooter>
    </Card>
  )
}

const NoticeList = () => {
  return (
    <>
      <Button asChild>
        <Link href={ROUTES.NOTICE.CREATE.url}>추가</Link>
      </Button>

      <div>
        
      </div>
    </>
  )
}

export default NoticeList