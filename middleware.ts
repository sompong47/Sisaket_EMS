import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role;

    console.log(`User Role: ${role}, Path: ${path}`); // แกะดู Log ได้

    // 🔴 กฎเหล็ก: ถ้าเป็น Staff ห้ามเข้าหน้า Admin
    // หน้า Admin คือ: หน้าแรก (/), หน้าจัดการศูนย์ (/centers), หน้าคลัง (/inventory)
    if (role === "staff") {
      if (path === "/" || path.startsWith("/centers") || path.startsWith("/inventory")) {
        // ดีดกลับไปหน้าคอกของตัวเอง (/staff)
        return NextResponse.redirect(new URL("/staff", req.url));
      }
    }

    // 🔴 กฎเหล็ก: ถ้าเป็น Admin ห้ามมาแย่งงานหน้า Staff (Optional)
    if (role === "admin" && path.startsWith("/staff")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // ต้อง Login ก่อนเสมอ
    },
  }
);

export const config = {
  // ระบุหน้าที่จะให้ยามเฝ้า
  matcher: [
    "/",
    "/staff/:path*",
    "/centers/:path*",
    "/inventory/:path*",
    "/logs/:path*",
    "/request/:path*" 
  ],
};