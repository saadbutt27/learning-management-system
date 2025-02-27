import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const c_id = searchParams.get("course_id");

    if (!c_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let res;

    if (c_id === "all") {
      res = await query({
        query: `SELECT 
                  c.c_id, c.course_name, c.course_code, c.semester_number
                FROM  course c 
                ORDER BY c.semester_number, c.c_id ASC;`,
        values: [],
      });
    } else {
      res = await query({
        query: `SELECT 
                 c.course_name, c.course_code, c.semester_number, cta.section, p.p_id, p.program_name
               FROM course_teacher_assign cta
               JOIN course c ON c.c_id = cta.c_id
               JOIN programs p on c.p_id = p.p_id
               WHERE cta.assign_id = $1;`,
        values: [c_id],
      });
    }

    if (res.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // console.log("C'ourse details:", res);

    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Failed to fetch course data" },
      { status: 500 }
    );
  }
}
