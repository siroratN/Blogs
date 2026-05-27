import { updateSession } from "@/lib/supabase/proxy";
import { NextResponse, NextRequest } from "next/server";
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    const secFetchSite = request.headers.get("sec-fetch-site");

    if (secFetchSite === "none" || secFetchSite === "cross-site") {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }     
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
