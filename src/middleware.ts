import { NextResponse } from "next/server";
import withAuth from "./middleware/withAuth";

export function mainMiddleware() {
  const res = NextResponse.next();
  return res;
}

export default withAuth(mainMiddleware, [
  "/",
  "/profile",
  "/profile/*",
  "/login",
  "/register",
]);
