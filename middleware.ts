import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // Protect dashboard routes
  if (url.pathname.startsWith('/dashboard')) {
    if (!user) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    const role = user.user_metadata?.role

    // Check specific role sub-paths
    if (url.pathname.startsWith('/dashboard/super-admin') && role !== 'super_admin') {
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
    if (url.pathname.startsWith('/dashboard/admin') && role !== 'admin') {
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
    if (url.pathname.startsWith('/dashboard/guru') && role !== 'guru') {
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
    if (url.pathname.startsWith('/dashboard/orang-tua') && role !== 'orang_tua') {
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }

  // Redirect logged-in users away from login page
  if (url.pathname === '/login' && user) {
    const role = user.user_metadata?.role
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

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
  ],
}
