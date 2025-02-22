import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const c_id = searchParams.get("course_id");

    if (c_id) {
      // Fetch a specific course
      const res = await query({
        query: `SELECT course_name FROM course WHERE c_id = $1;`,
        values: [c_id],
      });

      if (res.length === 0) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(res[0]);
    } else {
      // Fetch all courses
      const res = await query({
        query: `SELECT c_id, course_name, course_code FROM course;`,
        values: [],
      });

      return NextResponse.json(res);
    }
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Failed to fetch course data" },
      { status: 500 }
    );
  }
}
