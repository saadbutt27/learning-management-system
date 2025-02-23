import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Extract data from the request body
    const { course_name, course_code, credit_hours, semester_number, p_id } = await request.json();

    // Validation: Check required fields
    if (!course_name || !course_code || !credit_hours || !semester_number || !p_id) {
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
      INSERT INTO course (course_name, course_code, credit_hours, semester_number, p_id) 
      VALUES ($1, $2, $3, $4, $5) RETURNING c_id;
    `;
    
    const values = [course_name, course_code, credit_hours, semester_number, p_id];
    const result = await query({ query: insertQuery, values });

    if (!result || result.length === 0) {
      throw new Error("Failed to insert course");
    }

    await query({
      query: "COMMIT;",
      values: [],
    });

    return NextResponse.json({ success: true, courseId: result[0].c_id });
  } catch (error) {
    console.error("Error in POST request:", error);
    await query({ query: "ROLLBACK;", values: [] });
    return NextResponse.json(
      { error: "Failed to insert course" },
      { status: 500 }
    );
  }
}
