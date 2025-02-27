import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const fetchQuery = `
      SELECT 
        cta.t_id, 
        t.t_name, 
        cta.c_id, 
        c.course_name, 
        cta.section
      FROM course_teacher_assign cta
      JOIN teacher t ON cta.t_id = t.t_id
      JOIN course c ON cta.c_id = c.c_id
      ORDER BY cta.assign_id DESC;
    `;

    const result = await query({ query: fetchQuery, values: [] });

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
    const { t_id, c_id, section } = await request.json();

    // Validation: Check required fields
    if (!t_id || !c_id || !section) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await query({
      query: "BEGIN;",
      values: [],
    });

    // Insert data into the course_teacher_assign table
    const insertQuery = `
      INSERT INTO course_teacher_assign (t_id, c_id, section) 
      VALUES ($1, $2, $3) RETURNING assign_id;
    `;

    const values = [t_id, c_id, section];
    const result = await query({ query: insertQuery, values });

    if (!result || result.length === 0) {
      throw new Error("Failed to insert course-teacher assignment");
    }

    const fetchQuery = `
      SELECT 
        cta.t_id, 
        t.t_name, 
        cta.c_id, 
        c.course_name, 
        cta.section
      FROM course_teacher_assign cta
      JOIN teacher t ON cta.t_id = t.t_id
      JOIN course c ON cta.c_id = c.c_id
      WHERE cta.assign_id = $1;
    `;

    const finalResult = await query({
      query: fetchQuery,
      values: [result[0].assign_id],
    });

    await query({
      query: "COMMIT;",
      values: [],
    });

    return NextResponse.json({ success: true, newAssignment: finalResult[0] });
  } catch (error) {
    console.error("Error in POST request:", error);
    await query({ query: "ROLLBACK;", values: [] });
    return NextResponse.json(
      { error: "Failed to insert course-teacher assignment" },
      { status: 500 }
    );
  }
}
