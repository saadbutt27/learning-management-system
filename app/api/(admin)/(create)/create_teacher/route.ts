import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword } from "@/lib/passwordEncryption";

export async function POST(request: NextRequest) {
  try {
    // Extract data from the request body
    const { t_id, t_name, password } = await request.json();

    // console.log(t_id, t_name, password);

    // Validation: Check required fields
    if (!t_id || !t_name || !password) {
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
      INSERT INTO teacher (t_id , t_name, password)
      VALUES ($1, $2, $3) RETURNING t_id; 
    `;

    const values = [t_id, t_name, hashedPassword];
    const result = await query({ query: insertQuery, values });

    if (!result || result.length === 0) {
      throw new Error("Failed to insert teacher");
    }

    await query({
      query: "COMMIT;",
      values: [],
    });

    return NextResponse.json({ success: true, teacherId: result[0].t_id });
  } catch (error) {
    console.error("Error in POST request:", error);
    await query({ query: "ROLLBACK;", values: [] });
    return NextResponse.json(
      { error: "Failed to insert teacher" },
      { status: 500 }
    );
  }
}
