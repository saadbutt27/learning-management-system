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
      return NextResponse.json("Your are not eligible to access this page");
    }

    const res = await query({
      query: `SELECT 
                m.m_topic as topic, m.m_desc as description, m.m_upload_date as upload_date, m.m_file 
              FROM course_material m
              JOIN material_course mc ON m.m_id = mc.m_id
              WHERE c_id = $1
              ORDER BY m.m_upload_date DESC;`,
      values: [c_id!],
    });

    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Failed to fetch course data" },
      { status: 500 }
    );
  }
}
