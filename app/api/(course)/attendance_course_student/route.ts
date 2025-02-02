import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { c_id } = await request.json();

    if (!c_id) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const res = await query({
      query: `SELECT s.s_id as id, s.s_name as name FROM student s
        JOIN enroll_assign e ON e.s_id = s.s_id 
        WHERE e.c_id = $1; `,
      values: [c_id],
    });

    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Failed to fetch course attendance" },
      { status: 500 }
    );
  }
}
