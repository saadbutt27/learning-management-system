import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.headers.get("authorization")?.split(" ")[1];
    const { searchParams } = new URL(req.url);
    const q_id = searchParams.get("q_id");
    const c_id = searchParams.get("course_id");
    const s_id = searchParams.get("student_id");

    if (!q_id) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
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
                qu.question, qu.ques_opt_A, qu.ques_opt_B, qu.ques_opt_C, qu.ques_opt_D, qu.ques_correct_opt, qu.q_id, q.q_time 
              FROM questions qu 
              JOIN quiz q ON q.q_id = qu.q_id 
              JOIN quiz_course qc ON qc.c_id = $1
              AND qu.q_id = $2`,
      values: [c_id, q_id],
    });

    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz questions data" },
      { status: 500 }
    );
  }
}
