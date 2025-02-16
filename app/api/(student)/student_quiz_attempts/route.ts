import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q_id = searchParams.get("q_id");
    const t_id = searchParams.get("t_id");
    const c_id = searchParams.get("c_id");

    if (!q_id) {
      return NextResponse.json(
        { error: "Quiz id is required" },
        { status: 400 }
      );
    }
    if (!t_id) {
      return NextResponse.json(
        { error: "Teacher id is required" },
        { status: 400 }
      );
    }
    if (!c_id) {
      return NextResponse.json(
        { error: "Course id is required" },
        { status: 400 }
      );
    }

    const res = await query({
      query: `SELECT s.s_id, s.s_name, qa.upload_date, qa.marks_obtained, qa.total_marks 
            FROM student s 
            JOIN enroll_assign e ON s.s_id = e.s_id AND e.c_id = $1
            LEFT JOIN quiz_attempt qa ON s.s_id = qa.s_id 
            WHERE qa.q_id = $2 OR qa.q_id IS NULL
            ORDER BY qa.marks_obtained DESC;`,
      values: [c_id, q_id],
    });
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempts data" },
      { status: 500 }
    );
  }
}
