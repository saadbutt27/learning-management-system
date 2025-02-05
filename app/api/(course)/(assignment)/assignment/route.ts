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
      query: `SELECT a.at_file as file, a.at_id as assignment_id, a.at_topic as topic, a.at_desc as assignment_description, a.at_upload_date as upload_date, a.at_due_date as due_date, t.t_name as teacher_name, c.c_title as course_name 
              FROM course c JOIN teacher t ON t.t_id = c.t_id
              JOIN assignment a ON c.c_id = a.c_id 
              WHERE t.t_id = $1 AND c.c_id = $2 
              ORDER BY a.at_due_date DESC;`,
      values: [t_id, c_id],
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
