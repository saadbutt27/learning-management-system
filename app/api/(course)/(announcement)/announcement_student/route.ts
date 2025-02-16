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
                a.an_id, a.an_topic as topic, a,an_desc as description, a.an_upload_date as upload_date 
              FROM course_announcement a
              JOIN announcement_course ac ON a.an_id = ac.an_id
              WHERE ac.c_id = $1
              ORDER BY a.an_upload_date DESC;`,
      values: [c_id],
    });

    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements data" },
      { status: 500 }
    );
  }
}
