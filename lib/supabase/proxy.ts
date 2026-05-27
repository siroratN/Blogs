import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "../auth";

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }

    const payload = await verifyToken(token);

    if (!payload || payload.role !== "admin") {
      console.log("Unauthorized access attempt to admin page:", payload?.email || "No token");
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next({
    request,
  });
}