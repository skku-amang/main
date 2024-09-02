"use client"
import Image from 'next/image'
import Link from 'next/link'

import ROUTES from '../../../constants/routes'
import { cn } from '../../../lib/utils'
import NavLink from '../NavLink'
import Profile from './Profile'
import { useState } from 'react'

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

  const [isOpen, setIsOpen] = useState(false);

  const OpenSideMenu = () => {
    setIsOpen(!isOpen);
  }

  const OpenSideMenu_only_close = () => {
    setIsOpen(false);
  }

  return (
    <header
      className={cn(
        position,
        'top-0 z-10 flex h-full w-full justify-center bg-primary backdrop-blur'
      )}
      style={{ height }} >

      {/* Mobile */}
      <nav className="flex  justify-between w-full items-center md:hidden">
        <div className='flex-col h-full items-center justify-center pl-4' onClick={OpenSideMenu}>
          <div className='flex flex-col justify-center h-full gap-[0.3rem]'>
            <div className='bg-white w-8 h-[0.2rem]'></div>
            <div className='bg-white w-8 h-[0.2rem]'></div>
            <div className='bg-white w-8 h-[0.2rem]'></div>
          </div>
        </div>
        <div className='flex fixed ml-[45%] items-center'>
          <Link href="/">
            <Image src="/Logo.png" alt="logo" width={47} height={47} />
          </Link>
        </div>
        <div className='mr-10'>
        </div>
      </nav>    

      {/* 열리는 창 안에 있는 것들 고생이 많아 장수*/}
      <div className={`flex flex-col justify-center fixed top-0 left-0 h-screen w-[43%] bg-gray-800 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className='h-[90%] flex flex-col justify-center items-start'>
          <Link href={ROUTES.NOTICE.LIST.url} className='flex items-center justify-center w-full font-black text-2xl flex-1'>공지사항</Link>
          <Link href={ROUTES.PERFORMANCE.LIST.url} className='flex items-center justify-center w-full font-black text-2xl flex-1'>공연목록</Link>
          <Link href={ROUTES.TEAM.LIST.url} className='flex items-center justify-center w-full font-black text-2xl flex-1'>세션지원</Link>
          <Link href={ROUTES.MEMBER.LIST.url} className='flex items-center justify-center w-full font-black text-2xl flex-1'>멤버목록</Link>
        </div>
        <div className='flex-1 justify-center'><Profile/></div>
      </div>
      <div className={`${isOpen ? 'visible' : 'hidden'} w-full h-screen`} onClick={OpenSideMenu_only_close}></div>
      

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
