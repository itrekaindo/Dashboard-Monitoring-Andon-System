import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sql } from "drizzle-orm";

import { db } from "@/lib/db";

function parseRowResult(result: any) {
  return Array.isArray(result) ? (Array.isArray(result[0]) ? result[0] : result) : [];
}

type JwtPayload = {
  uid?: number;
};

export async function GET(request: Request) {
  try {
    const token = request.headers
      .get("cookie")
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json({ message: "JWT_SECRET belum diset" }, { status: 500 });
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    const userId = Number(decoded?.uid);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const columnResult = await db.execute(sql`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'auth_users'
        AND COLUMN_NAME IN ('departemen', 'department')
    `);

    const columns = parseRowResult(columnResult).map((row: any) => String(row.COLUMN_NAME || "").toLowerCase());

    let departmentExpression = "role";
    if (columns.includes("departemen")) {
      departmentExpression = "departemen";
    } else if (columns.includes("department")) {
      departmentExpression = "department";
    }

    const userResult = await db.execute(sql`
      SELECT
        id,
        name,
        email,
        role,
        ${sql.raw(departmentExpression)} AS department
      FROM auth_users
      WHERE id = ${userId}
      LIMIT 1
    `);

    const users = parseRowResult(userResult);
    const user = users[0];

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        department: user.department || user.role || "-",
      },
    });
  } catch (error) {
    console.error("GET /api/auth/me error", error);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
