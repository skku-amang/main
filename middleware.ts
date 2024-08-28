import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { match } from 'path-to-regexp'

import { auth } from '@/../auth'

import ROUTES from './constants/routes'

const matchersForAuth = [
  '/admin',
  '/admin/*',
  '/performances',
  '/performances/*',
]
const matchersForSignIn = [
  '/signup/*',
  '/login/*'
]

export async function middleware(request: NextRequest) {
  console.log(request.nextUrl.pathname)
  // 인증이 필요한 페이지 접근 제어!
  if (isMatch(request.nextUrl.pathname, matchersForAuth)) {
    return (await auth()) // 세션 정보 확인
      ? NextResponse.next()
      : NextResponse.redirect(new URL(ROUTES.LOGIN.url, request.url))
      // : NextResponse.redirect(new URL(`/signin?callbackUrl=${request.url}`, request.url))
  }
  // 인증 후 회원가입 및 로그인 접근 제어!
  if (isMatch(request.nextUrl.pathname, matchersForSignIn)) {
    return (await auth())
      ? NextResponse.redirect(new URL('/', request.url))
      : NextResponse.next()
  }
  return NextResponse.next()
}

// 경로 일치 확인!
function isMatch(pathname: string, urls: string[]) {
  return urls.some(url => !!match(url)(pathname))
}