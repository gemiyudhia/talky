import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Tentukan URL yang memerlukan autentikasi
const protectedRoutes = ["/profile", "/"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Periksa apakah route yang diakses perlu autentikasi
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    // Ambil token JWT dari cookie
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      // Jika token tidak valid, arahkan ke halaman login
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // Lanjutkan request jika token valid atau tidak memerlukan autentikasi
  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/"], // Tentukan route yang dilindungi
};
