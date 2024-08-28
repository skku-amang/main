import Image from 'next/image'
import Link from 'next/link'

import ROUTES from '../../../constants/routes'
import { cn } from '../../../lib/utils'
import NavLink from '../NavLink'
import Profile from './Profile'

const Header = ({ position, height }: { position: 'sticky' | 'fixed'; height: string }) => {
  const menuItems: { name: string; url: string; active: boolean }[] = [
    { name: '공지사항', url: ROUTES.NOTICE.LIST.url, active: false },
    { name: '공연목록', url: ROUTES.PERFORMANCE.LIST.url, active: true },
    { name: '세션지원', url: ROUTES.TEAM.LIST.url, active: true },
    { name: '사진앨범', url: ROUTES.GALLERY.url, active: false }
  ]

  return (
    <header className={cn(position, 'top-0 z-10 flex w-full h-full justify-center backdrop-blur bg-primary')} style={{ height }}>
      {/* Tablet & Desktop */}
      <nav className="invisible flex w-full h-full items-center px-10 md:visible">
        <div className="mx-auto flex w-full h-full items-center justify-between lg:w-[1280px]">
          {/* Logo */}
          <Link href="/">
            <Image src="/Logo.png" alt="logo" width={47} height={47} />
          </Link>

          {/* MenuItems */}
          <div className="flex justify-center gap-x-24 h-full">
            {menuItems.map((menuItem) => (
              <NavLink key={menuItem.name} href={menuItem.url} active={menuItem.active}>
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
