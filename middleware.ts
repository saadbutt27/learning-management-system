import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    if (
      req.nextUrl.pathname.startsWith("/teacher") &&
      req.nextauth.token?.role !== "teacher"
    ) {
      return NextResponse.redirect(new URL("/student", req.url));
    }
    if (
      req.nextUrl.pathname.startsWith("/student") &&
      req.nextauth.token?.role !== "student"
    ) {
      return NextResponse.redirect(new URL("/teacher", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard", "/", "/student/:path*", "/teacher/:path*"],
};
