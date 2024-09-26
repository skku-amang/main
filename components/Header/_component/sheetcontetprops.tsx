import Link from "next/link"
import { FaCalendar, FaDoorOpen, FaGuitar, FaInstagram, FaList, FaPeopleArrows, FaYoutube } from "react-icons/fa"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import ROUTES from "@/constants/routes"

const SheetContentProps = () => {

 return (

    <div className="flex flex-col w-full h-full">
       <Link href={ROUTES.LOGIN.url} className="flex w-full h-[10%] justify-start items-center py-[4%]">
            <Avatar className="w-12 h-12">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar> 
            <div className="w-full pl-4">
                <div className="w-full h-full text-black font-semibold text-lg text-center">로그인 <br/>해주세요</div>
            </div>             
        </Link>
        <Separator/>
        <div className="w-full h-[40%] pt-[2%]">
            <div className="w-full h-[12%] text-gray-500 text-base pb-[8%]">MAIN</div>
            <Link href={ROUTES.NOTICE.LIST.url} className='flex items-center font-medium text-lg text-gray-500 w-full h-[22%]'>
                <FaCalendar size={25} style={{ color: '#BEBEBE' }}/>
                <div className="text-gray-500 font-medium text-lg pl-4">공지사항</div>
            </Link>
            <Link href={ROUTES.PERFORMANCE.LIST.url} className='flex items-center font-medium text-lg text-gray-500 w-full h-[22%]'>
                <FaList size={25} style={{ color: '#BEBEBE' }} />
                <div className="text-gray-500 font-medium text-lg pl-4">공연목록</div>
            </Link>
            <Link href={ROUTES.TEAM.LIST.url} className='flex items-center font-medium text-lg text-gray-500 w-full h-[22%]'>
                <FaGuitar size={25} style={{ color: '#BEBEBE' }}/>
                <div className="text-gray-500 font-medium text-lg pl-4">세션지원</div>
            </Link>
            <Link href={ROUTES.MEMBER.LIST.url} className='flex items-center font-medium text-lg text-gray-500 w-full h-[22%]'>
                <FaPeopleArrows size={25} style={{ color: '#BEBEBE' }}/>
                <div className="text-gray-500 font-medium text-lg pl-4">멤버목록</div>                
            </Link>
        </div>
        <Separator/>
        <div className="flex flex-col justify-start w-full h-[24%] pt-[2%]">
            <div className="w-full h-[21.6%] text-gray-500 text-base pb-[13.3%]">LINKS</div>
            <div className='flex items-center text-gray-500 w-full h-[41.4%]'>
                <FaYoutube size={30} style={{ color: '#BEBEBE' }} />
                <div className='text-gray-500 font-medium text-lg pl-4'>YouTube</div>
            </div>
            <div className='flex items-center text-gray-500 w-full h-[41.4%]'>
                <FaInstagram size={30} style={{ color: '#BEBEBE' }} />
                <div className='text-gray-500 font-medium text-lg pl-4'>Instagram</div>
            </div>
        </div>
        <Link href={ROUTES.LOGIN.url} className="flex justify-center items-center gap-4 w-full h-[9%] pt-[85%]">
            <FaDoorOpen size={30} style={{ color: '#023664' }} />
            <div className="text-xl font-medium text-primary">Login Account</div>
        </Link>
    </div>
 )

}

export default SheetContentProps