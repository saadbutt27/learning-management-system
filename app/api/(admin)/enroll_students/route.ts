import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Extract the s_id from the query parameters
    const url = new URL(request.url);
    const s_id = url.searchParams.get("s_id");
    const fetchQuery = `
      SELECT   
        s.s_id,
        s.s_name,
        e.c_id,  
        c.course_name,  
        c.semester_number,  
        cta.section 
      FROM enroll_assign e  
      INNER JOIN student s 
        ON s.s_id = e.s_id
      INNER JOIN course_teacher_assign cta  
        ON cta.assign_id = e.c_id  
      INNER JOIN course c  
        ON c.c_id = cta.c_id  
      LEFT JOIN programs p  
        ON p.p_id = c.p_id  
      WHERE e.s_id = $1;
    `;

    const result = await query({ query: fetchQuery, values: [s_id] });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Failed to fetch assigned courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Extract data from the request body
    const { s_id, c_id, section } = await request.json();

    // Validation: Check required fields
    if (!s_id || !c_id || !section) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await query({
      query: "BEGIN;",
      values: [],
    });

    const assignemntId = await query({
      query:
        "SELECT assign_id FROM course_teacher_assign WHERE c_id = $1 AND section = $2;",
      values: [c_id, section],
    });

    // Insert data into the course_teacher_assign table
    const insertQuery = `
      INSERT INTO enroll_assign (s_id, c_id) 
      VALUES ($1, $2) RETURNING assign_id;
    `;

    const values = [s_id, assignemntId[0].assign_id];
    const result = await query({ query: insertQuery, values });

    if (!result || result.length === 0) {
      throw new Error("Failed to insert course-teacher assignment");
    }

    await query({
      query: "COMMIT;",
      values: [],
    });

    return NextResponse.json({ success: true, assignId: result[0].assign_id });
  } catch (error) {
    console.error("Error in POST request:", error);
    await query({ query: "ROLLBACK;", values: [] });
    return NextResponse.json(
      { error: "Failed to insert course-teacher assignment" },
      { status: 500 }
    );
  }
}
