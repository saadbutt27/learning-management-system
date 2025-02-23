import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Extract the s_id from the query parameters
    const url = new URL(request.url);
    const s_id = url.searchParams.get("s_id");

    if (!s_id) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Fetch courses based on the provided s_id
    const res = await query({
      query: `
        SELECT  
          p.p_id AS program_id,  
          p.program_name AS program_name,  
          e.c_id AS course_id,  
          c.course_name AS course_name,  
          cta.t_id AS t_id,  
          c.semester_number AS semester_number,  
          cta.section AS section 
        FROM enroll_assign e  
        INNER JOIN course_teacher_assign cta  
          ON cta.assign_id = e.c_id  
        INNER JOIN course c  
          ON c.c_id = cta.c_id  
        LEFT JOIN programs p  
          ON p.p_id = c.p_id  
        WHERE e.s_id = $1;
      `,
      values: [s_id],
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
