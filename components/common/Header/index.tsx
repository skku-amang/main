import Image from 'next/image'
import Link from 'next/link'

import ROUTES from '../../../constants/routes'
import { cn } from '../../../lib/utils'
import NavLink from '../NavLink'
import Profile from './Profile'

const Header = ({
  position,
  height
}: {
  position: 'sticky' | 'fixed'
  height: string
}) => {
  const menuItems: { name: string; url: string; active: boolean }[] = [
    { name: '공지사항', url: ROUTES.NOTICE.LIST.url, active: false },
    { name: '공연목록', url: ROUTES.PERFORMANCE.LIST.url, active: true },
    { name: '세션지원', url: ROUTES.TEAM.LIST.url, active: true },
    { name: '맴버목록', url: ROUTES.MEMBER.LIST.url, active: true }
  ]

  return (
    <header
      className={cn(
        position,
        'top-0 z-10 flex h-full w-full justify-center bg-primary backdrop-blur'
      )}
      style={{ height }} >

      {/* Tablet & Desktop */}
      <nav className="flex justify-between w-full items-center md:hidden">
        <div className='flex flex-col gap-[0.3rem] ml-6'>
            <div className='bg-white w-[30px] h-[0.2rem]'></div>
            <div className='bg-white w-[30px] h-[0.2rem]'></div>
            <div className='bg-white w-[30px] h-[0.2rem]'></div>
        </div>
        <div className='flex items-center'>
          <Link href="/">
            <Image src="/Logo.png" alt="logo" width={47} height={47} />
          </Link>
        </div>
        <div className='mr-10'>
        </div>
      </nav>


      {/* Tablet & Desktop */}
      <nav className="hidden md:flex h-full w-full items-center px-10 md:visible">
        <div className="mx-auto flex h-full w-full items-center justify-between lg:w-[1280px]">
          {/* Logo */}
          <Link href="/">
            <Image src="/Logo.png" alt="logo" width={47} height={47} />
          </Link>

          {/* MenuItems */}
          <div className="flex h-full justify-center md:gap-x-7 lg:gap-x-16 xl:gap-x-24">
            {menuItems.map((menuItem) => (
              <NavLink 
                key={menuItem.name}
                href={menuItem.url}
                active={menuItem.active}
              >
                {menuItem.name}
              </NavLink>
            ))}
          </div>

          {/* Personal */}
          <Profile />
        </div>
      </nav>
    </header>
  )
}

export default Header
