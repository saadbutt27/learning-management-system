import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Extract the s_id from the query parameters
    const url = new URL(request.url);
    const t_id = url.searchParams.get("t_id");

    if (!t_id) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Fetch courses based on the provided s_id
    const res = await query({
      query: `
        SELECT pn.program_name, c.c_id AS course_id, c.c_title AS course_name, c.t_id, c.semester_num, c.section 
        FROM course c 
        JOIN teacher t ON c.t_id = t.t_id AND c.t_id = $1
        LEFT JOIN program p ON c.p_id = p.p_id AND c.semester_num = p.semester_num
        LEFT JOIN program_name pn ON pn.pn_id = p.pn_id;
      `,
      values: [t_id],
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
