import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/sign-in", "/sign-up"];
const ENCODED_CHAR_REGEX = /%[0-9A-Fa-f]{2}/;

async function validateJWT(jwt: string | undefined) {
  if (!jwt) {
    return false;
  }

  try {
    await axios(`${process.env.BACKEND_BASE_URL}/ready`, {
      method: "GET",
      headers: {
        Cookie: `jwt=${jwt}`,
      },
    });
    return true;
  } catch (error) {
    const err = error as AxiosError;
    if (err.response?.status === 401) {
      console.log("JWT validation failed", err);
    }
    // TODO: handle other errors here, e.g. 500
    return false;
  }
}

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

  // Handle non-public paths without JWT
  if (!jwt && !isPublicPath) {
    console.log("running this");
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Skip JWT validation for public paths without JWT
  if (!jwt && isPublicPath) {
    return NextResponse.next();
  }

  const isValidJWT = await validateJWT(jwt?.value);

  // Redirect to sign-in if JWT is invalid
  if (!isValidJWT) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Redirect authenticated users away from public paths
  if (isPublicPath) {
    return NextResponse.redirect(new URL("/home", req.url));
  }
  console.log("middleware PASS");

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT for the ones starting with:
     * - web/api (API routes)
     * - web/_next/static (static files)
     * - web/_next/image (image optimization files)
     * Also excludes all paths ending with .png
     */
    "/((?!api|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
