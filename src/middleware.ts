// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from './uttils/Routes';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const sid = request.cookies.get('sid')?.value;
  const isLoggedIn = sid && sid !== 'Guest';

  // If trying to access a protected route without auth
  const isProtectedRoute = ROUTES.some((route) => url.pathname.startsWith(route.path));
  
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // If logged in but trying to access /auth or /
  if (isLoggedIn && (url.pathname === '/auth' || url.pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// import type { NextRequest } from 'next/server';
// import { NextResponse } from 'next/server';
// import { ROUTES } from './uttils/Routes';

// export function middleware(request: NextRequest) {
//   // const PROTECTED_ROUTES = ['/dashboard', '/orders', '/organization', '/products', '/subscription'];
//   const url = request.nextUrl.clone();
//   //   const role = request.cookies.get('role')?.value;
//   const isLogin =
//     request.cookies.get('sid')?.value && request.cookies.get('sid')?.value !== 'Guest';

//   const isProtected = ROUTES.some((value) => url.pathname.includes(value.path));
//   // const refreshToken = request.cookies.get("refresh_token")?.value;
//   const userRole = 'admin';
//   const isRoleAccess = ROUTES.some((value) => {
//     if (value.roles) {
//       return value.roles.includes(userRole);
//     }
//     return false;
//   });

//   //   if (!isLogin) {
//   //     return NextResponse.redirect(url);
//   //   }
//   if (isLogin && !isRoleAccess) {
//     if (isProtected) {
//       url.pathname = '/asdfasf';

//       return NextResponse.redirect(url);
//     }
//   }
//   if (isLogin) {
//     if (url.pathname === '/auth' || url.pathname === '/') {
//       url.pathname = '/dashboard';
//       return NextResponse.redirect(url);
//     }
//   }
//   if (!isLogin) {
//     if (isProtected || url.pathname == '/') {
//       //   url.searchParams.set('from', url.pathname);
//       url.pathname = '/auth';
//       return NextResponse.redirect(url);
//     }
//   } else {
//   }

//   return NextResponse.next();
// }

// // See "Matching Paths" below to learn more
// // export const config = {
// //   matcher: ["/customer-profile/:path*", "/driver-profile/:path*"],
// // };
