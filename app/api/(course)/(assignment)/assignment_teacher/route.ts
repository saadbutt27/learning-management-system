import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.headers.get("authorization")?.split(" ")[1];
    const { searchParams } = new URL(req.url);
    const t_id = searchParams.get("teacher_id");
    const c_id = searchParams.get("course_id");

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

    const decodedToken = jwt.decode(accessToken!) as jwt.JwtPayload;
    if (decodedToken?.t_id != t_id) {
      return NextResponse.json(
        { error: "Your are not eligible to access this page" },
        { status: 401 }
      );
    }

    const res = await query({
      query: `SELECT a.at_topic as topic, a.at_id as assignment_id, a.at_desc as assignment_description, a.at_upload_date as upload_date, a.at_due_date as due_date, a.at_file as file
        FROM assignment a WHERE a.c_id = $1 ORDER BY a.at_due_date DESC;`,
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
