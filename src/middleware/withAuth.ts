import { getToken } from "next-auth/jwt";
import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

// Halaman yang tidak memerlukan otentikasi (login, register)
const authPage = ["/login", "/register"];

// Fungsi middleware untuk otentikasi
export default function withAuth(
  middleware: NextMiddleware,
  requireAuth: string[] = ["/", "/profile"]
) {
  return async (req: NextRequest, res: NextFetchEvent) => {
    const pathname = req.nextUrl.pathname;

    // Mengambil token otentikasi dari cookie
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Cek jika pengguna mencoba mengakses halaman auth (login/register) saat sudah login
    if (authPage.includes(pathname)) {
      if (token) {
        // Jika sudah login, arahkan ke halaman utama
        return NextResponse.redirect(new URL("/", req.url));
      }
      // Lanjutkan ke halaman login/register jika belum ada token
      return NextResponse.next();
    }

    // Cek apakah rute memerlukan otentikasi (termaksud /profile/*)
    const requiresAuthMatch = requireAuth.some((pattern) =>
      // Memungkinkan pencocokan pola dinamis dengan ekspresi regular
      pathname.match(new RegExp(`^${pattern.replace("*", ".*")}$`))
    );

    if (requiresAuthMatch) {
      if (!token) {
        // Jika tidak ada token, arahkan pengguna ke halaman login
        const url = new URL("/login", req.url);
        url.searchParams.set("callbackUrl", encodeURIComponent(req.url));
        return NextResponse.redirect(url);
      }
      // Lanjutkan jika ada token (sudah login)
      return NextResponse.next();
    }

    // Lanjutkan ke middleware lain jika tidak ada pencocokan
    return middleware(req, res);
  };
}
