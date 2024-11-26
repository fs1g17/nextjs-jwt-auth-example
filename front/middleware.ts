import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/sign-in", "/sign-up"];
const ENCODED_CHAR_REGEX = /%[0-9A-Fa-f]{2}/;

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Handle encoded URLs
  if (ENCODED_CHAR_REGEX.test(pathname)) {
    console.log("middleware: before rewrite", pathname);
    const decodedPathname = decodeURIComponent(pathname);
    return NextResponse.rewrite(new URL(`/app${decodedPathname}`, req.url));
  }

  // Skip middleware for Next.js internal routes
  if (pathname.includes("/_next/")) {
    return NextResponse.next();
  }

  const jwt = req.cookies.get("jwt");
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  console.log("middleware path:", pathname, "isPublicPath", isPublicPath);
}
