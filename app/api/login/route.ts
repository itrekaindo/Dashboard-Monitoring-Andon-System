import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { authUsers } from "@/lib/schema/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const emailNorm = String(email ?? "").trim().toLowerCase();
    const pass = String(password ?? "");

    if (!emailNorm || !pass) {
      return NextResponse.json({ message: "Email & password wajib" }, { status: 400 });
    }

    const rows = await db
      .select({
        id: authUsers.id,
        name: authUsers.name,
        email: authUsers.email,
        password: authUsers.password,
        role: authUsers.role,
        isActive: authUsers.isActive,
      })
      .from(authUsers)
      .where(eq(authUsers.email, emailNorm))
      .limit(1);

    const user = rows[0];
    if (!user) return NextResponse.json({ message: "Login gagal" }, { status: 401 });
    if (Number(user.isActive) !== 1)
      return NextResponse.json({ message: "Akun nonaktif" }, { status: 403 });

    const ok = await bcrypt.compare(pass, user.password);
    if (!ok) return NextResponse.json({ message: "Login gagal" }, { status: 401 });

    const secret = process.env.JWT_SECRET;
    if (!secret) return NextResponse.json({ message: "JWT_SECRET belum diset" }, { status: 500 });

    const token = jwt.sign(
      { uid: user.id, role: user.role, name: user.name, email: user.email },
      secret,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({
      message: "ok",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ message: err?.message ?? "Server error" }, { status: 500 });
  }
}

export {};