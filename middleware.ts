import { NextResponse, type NextRequest } from 'next/server'
import { decodeJWT, isJWTExpired } from '@/lib/jwt'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('sekolah_tk_token')?.value
  const user = token ? await decodeJWT(token) : null

  const url = request.nextUrl.clone()

  // Protect dashboard routes
  if (url.pathname.startsWith('/dashboard')) {
    const isServerAction = Boolean(request.headers.get('next-action'))

    if (!user || isJWTExpired(user)) {
      if (isServerAction) {
        const response = new NextResponse('Sesi login Anda telah berakhir. Silakan login kembali.', {
          status: 401,
          headers: {
            'content-type': 'text/plain',
            'x-action-redirect': '/login;replace',
          },
        })
        response.cookies.delete('sekolah_tk_token')
        return response
      }

      // Clear cookie and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('sekolah_tk_token')
      return response
    }

    const role = user.role

    // Check specific role sub-paths
    if (url.pathname.startsWith('/dashboard/super-admin') && role !== 'super_admin') {
      if (isServerAction) {
        return new NextResponse('Tidak memiliki izin.', {
          status: 403,
          headers: { 'content-type': 'text/plain', 'x-action-redirect': '/unauthorized;replace' },
        })
      }
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
    if (url.pathname.startsWith('/dashboard/admin') && role !== 'admin' && role !== 'super_admin') {
      if (isServerAction) {
        return new NextResponse('Tidak memiliki izin.', {
          status: 403,
          headers: { 'content-type': 'text/plain', 'x-action-redirect': '/unauthorized;replace' },
        })
      }
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
    if (url.pathname.startsWith('/dashboard/guru') && role !== 'guru') {
      if (isServerAction) {
        return new NextResponse('Tidak memiliki izin.', {
          status: 403,
          headers: { 'content-type': 'text/plain', 'x-action-redirect': '/unauthorized;replace' },
        })
      }
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
    if (url.pathname.startsWith('/dashboard/orang-tua') && role !== 'orang_tua') {
      if (isServerAction) {
        return new NextResponse('Tidak memiliki izin.', {
          status: 403,
          headers: { 'content-type': 'text/plain', 'x-action-redirect': '/unauthorized;replace' },
        })
      }
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }

  // Redirect logged-in users away from login page
  if (url.pathname === '/login' && user && !isJWTExpired(user)) {
    const role = user.role
    if (role === 'super_admin') {
      url.pathname = '/dashboard/super-admin'
    } else if (role === 'admin') {
      url.pathname = '/dashboard/admin'
    } else if (role === 'guru') {
      url.pathname = '/dashboard/guru'
    } else if (role === 'orang_tua') {
      url.pathname = '/dashboard/orang-tua'
    } else {
      url.pathname = '/'
    }
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
  ],
}
