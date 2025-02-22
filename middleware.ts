import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const rolePaths = {
      teacher: "/teacher",
      student: "/student",
      admin: "/admin",
    };

    const userRole = req.nextauth.token?.role;
    const unauthorizedRedirect = Object.entries(rolePaths).find(
      ([role, path]) =>
        req.nextUrl.pathname.startsWith(path) && userRole !== role
    );

    if (unauthorizedRedirect) {
      return NextResponse.redirect(
        new URL(rolePaths[userRole as keyof typeof rolePaths] || "/", req.url)
      );
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard", "/", "/student/:path*", "/teacher/:path*", "/admin/:path*"],
};
