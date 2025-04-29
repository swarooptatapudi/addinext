import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ROUTES } from './uttils/Routes';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const isLogin = request.cookies.get('sid')?.value && request.cookies.get('sid')?.value !== 'Guest';
  const isProtected = ROUTES.some((value) => url.pathname.startsWith(value.path));
  
  // If not logged in and trying to access protected route
  if (!isLogin && isProtected) {
    url.pathname = '/auth';
    return NextResponse.redirect(url);
  }
  
  // If logged in and trying to access auth page
  if (isLogin && (url.pathname === '/auth' || url.pathname === '/')) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // If logged in but doesn't have role access
  const userRole = 'admin'; // This should come from cookies or session
  const hasRoleAccess = ROUTES.some((value) => 
    value.path === url.pathname && 
    (!value.roles || value.roles.includes(userRole))
  );
  
  if (isLogin && !hasRoleAccess && isProtected) {
    url.pathname = '/unauthorized';
    return NextResponse.redirect(url);
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
