import Image from 'next/image'
import Link from 'next/link'

import ROUTES from '../../../constants/routes'
import { cn } from '../../../lib/utils'
import NavLink from '../NavLink'
import Profile from './Profile'

export const HeaderInner = ({
  style,
  className,
  height
}: {
  style?: object
  className?: string
  height: string
}) => {
  const menuItems: { name: string; url: string; active: boolean }[] = [
    { name: '공지사항', url: ROUTES.NOTICE.LIST.url, active: false },
    { name: '공연목록', url: ROUTES.PERFORMANCE.LIST.url, active: true },
    { name: '세션지원', url: ROUTES.TEAM.LIST.url, active: true },
    { name: '맴버목록', url: ROUTES.MEMBER.LIST.url, active: true }
  ]

  return (
    <nav
      style={{ ...style, height }}
      className={cn(
        className,
        'flex h-full w-0 items-center overflow-hidden px-0 md:w-full'
      )}
    >
      <div className="mx-auto flex h-full w-full items-center justify-between lg:w-[1280px]">
        {/* Logo */}
        <Link href="/">
          <Image src="/Logo.png" alt="logo" width={47} height={47} />
        </Link>

        {/* MenuItems */}
        <div className="flex h-full justify-center gap-x-24">
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
  )
}

const Header = ({
  position,
  height
}: {
  position: 'sticky' | 'fixed'
  height: string
}) => {
  return (
    <header
      className={cn(
        position,
        'top-0 z-10 flex h-full w-full justify-center bg-primary backdrop-blur'
      )}
      style={{ height }}
    >
      <HeaderInner height={height} />
    </header>
  )
}

export default Header
