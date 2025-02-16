import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const c_id = searchParams.get("course_id");
    const t_id = searchParams.get("teacher_id");
    const accessToken = req.headers.get("authorization")?.split(" ")[1];

    if (!c_id) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }
    if (!t_id) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    const decodedToken = jwt.decode(accessToken!) as jwt.JwtPayload;
    if (decodedToken?.t_id != t_id) {
      return NextResponse.json(
        { error: "Your are not eligible to access this page" },
        { status: 500 }
      );
    }

    const res = await query({
      query: `SELECT 
                q.q_id, q.q_topic, q.q_desc, q.q_upload_date, q.q_due_date, q.q_time 
                FROM quiz q
                JOIN quiz_course qc ON qc.q_id = q.q_id
                WHERE qc.c_id = $1
                ORDER BY q.q_upload_date DESC;`,
      values: [c_id],
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

export async function PATCH(request: NextRequest) {
  try {
    const { q_id, due_date } = await request.json();
    if (!q_id) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }
    if (!due_date) {
      return NextResponse.json(
        { error: "Due date is required" },
        { status: 400 }
      );
    }
    const res = await query({
      query: `UPDATE quiz SET q_due_date = $1 where q_id = $2 RETURNING q_due_date;`,
      values: [due_date, q_id],
    });

    if (res.length > 0) {
      return NextResponse.json({ updated_due_date: res[0].q_due_date });
    } else {
      return NextResponse.json(
        { error: "Quiz not found or no changes made" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error in PATCH request:", error);
    return NextResponse.json(
      { error: "Failed to update quiz" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q_id = searchParams.get("q_id");

    if (!q_id) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    await query({
      query: `DELETE FROM quiz WHERE q_id = $1;`,
      values: [q_id],
    });

    return NextResponse.json({ code: 1 });
  } catch (error) {
    console.error("Error in DELETE request:", error);
    return NextResponse.json(
      { error: "Failed to delete quiz" },
      { status: 500 }
    );
  }
}
