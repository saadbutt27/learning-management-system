import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword } from "@/lib/passwordEncryption";

export async function POST(request: NextRequest) {
  try {
    // Extract data from the request body
    const { s_id, s_name, password, semester_number, p_id } = await request.json();

    // console.log(s_id, s_name, password, semester_number, p_id);

    // Validation: Check required fields
    if (!s_id || !s_name || !password || !semester_number || !p_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const hashedPassword = await hashPassword(password);

    await query({
      query: "BEGIN;",
      values: [],
    });

    // Insert data into the course_teacher_assign table
    const insertQuery = `
      INSERT INTO student (s_id, s_name, password, semester_num, p_id)
      VALUES ($1, $2, $3, $4, $5) RETURNING s_id; 
    `;

    const values = [s_id, s_name, hashedPassword, semester_number, p_id];
    const result = await query({ query: insertQuery, values });

    if (!result || result.length === 0) {
      throw new Error("Failed to insert student");
    }

    await query({
      query: "COMMIT;",
      values: [],
    });

    return NextResponse.json({ success: true, studentId: result[0].s_id });
  } catch (error) {
    console.error("Error in POST request:", error);
    await query({ query: "ROLLBACK;", values: [] });
    return NextResponse.json(
      { error: "Failed to insert student" },
      { status: 500 }
    );
  }
}
