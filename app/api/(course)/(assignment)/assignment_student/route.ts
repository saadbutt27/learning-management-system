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
      return NextResponse.json(
        { error: "Your are not eligible to access this page" },
        { status: 500 }
      );
    }

    const res = await query({
      query: `SELECT 
                ac.c_id as course_id, a.at_topic as topic, a.at_id as assignment_id, a.at_desc as assignment_description, a.at_upload_date as upload_date, a.at_due_date as due_date, a.at_file as file, a.is_edit_allowed_after_submission as is_edit_allowed_after_submission
              FROM assignment a 
              JOIN assignment_course ac ON a.at_id = ac.at_id
              WHERE ac.c_id = $1
              ORDER BY a.at_due_date DESC;`,
      values: [c_id],
    });

    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments data" },
      { status: 500 }
    );
  }
}
