import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Extract data from the request body
    const { assignment_id, student_id, fileLink } =
      await request.json();

    // Validation: Check required fields
    if (!assignment_id || !student_id || !fileLink) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await query({
      query: "BEGIN;",
      values: [],
    });

    // Insert assignment details into the assignment table
    const assignmentInsertQuery = `
      INSERT INTO assignment_submissions (s_id, at_id, attempt, upload_date, assignment_file) 
      VALUES ($1, $2, TRUE, CURRENT_TIMESTAMP, $3) returning *;
    `;
    const assignmentValues = [student_id, assignment_id, fileLink || null];
    const assignmentResult = await query({
      query: assignmentInsertQuery,
      values: assignmentValues,
    });

    // console.log(assignmentResult);

    if (!assignmentResult || assignmentResult.length === 0) {
      throw new Error("Failed to insert assignment submission");
    }

    await query({
      query: "COMMIT;",
      values: [],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { error: "Failed to insert assignment submission data" },
      { status: 500 }
    );
  }
}
