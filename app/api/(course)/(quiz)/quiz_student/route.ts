import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.headers.get("authorization")?.split(" ")[1];
    const { searchParams } = new URL(req.url);
    const c_id = searchParams.get("course_id");
    const s_id = searchParams.get("student_id");

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
                q.q_id, 
                q.q_topic, 
                q.q_desc, 
                q.q_upload_date, 
                q.q_due_date, 
                q.q_time, 
                qa.attempt, 
                qa.marks_obtained, 
                qa.total_marks
            FROM quiz q
            JOIN quiz_course qc ON q.q_id = qc.q_id
            LEFT JOIN quiz_attempt qa ON qa.q_id = q.q_id AND qa.s_id = $1
            WHERE qc.c_id = $2
            ORDER BY q.q_due_date DESC;
`,
      values: [s_id, c_id],
    });

    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes data" },
      { status: 500 }
    );
  }
}
