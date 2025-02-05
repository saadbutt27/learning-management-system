import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.headers.get("authorization")?.split(" ")[1];
    const { searchParams } = new URL(req.url);
    const t_id = searchParams.get("teacher_id");
    const c_id = searchParams.get("course_id");
    const s_id = searchParams.get("student_id");

    if (!t_id) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }
    if (!c_id) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }
    if (!s_id) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    const decodedToken = jwt.decode(accessToken!) as jwt.JwtPayload;
    if (decodedToken?.s_id != s_id) {
      return NextResponse.json("Your are not eligible to access this page");
    }

    const res = await query({
      query: `SELECT a.date_of_attendance, m.attendance_state, a.a_id FROM attendance a 
              JOIN mark_attendance m ON m.a_id = a.a_id AND m.s_id = $1 AND a.c_id = $2 
              ORDER BY a.date_of_attendance DESC;`,
      values: [s_id!, c_id!],
    });

    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance data" },
      { status: 500 }
    );
  }
}
