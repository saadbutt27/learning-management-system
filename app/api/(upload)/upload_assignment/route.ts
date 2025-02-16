import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Extract data from the request body
    const { topic, desc, selectedCourses, fileLink, dueDate } =
      await request.json();

    // Validation: Check required fields
    if (!topic || !desc || !dueDate || !(selectedCourses?.length > 0)) {
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
      INSERT INTO assignment (at_topic, at_desc, at_upload_date, at_due_date, at_file) 
      VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4) RETURNING at_id;
    `;
    const assignmentValues = [topic, desc, dueDate, fileLink || null];
    const assignmentResult = await query({
      query: assignmentInsertQuery,
      values: assignmentValues,
    });

    if (!assignmentResult || assignmentResult.length === 0) {
      throw new Error("Failed to insert assignment");
    }

    const assignmentId = assignmentResult[0].at_id;

    // Insert course relations into the assignment_course table
    const courseInsertQuery =
      `
      INSERT INTO assignment_course (at_id, c_id) VALUES ` +
      selectedCourses.map((index: number) => `($1, $${index + 2})`).join(", ") +
      `;`;

    const courseValues = [assignmentId, ...selectedCourses];
    await query({ query: courseInsertQuery, values: courseValues });

    await query({
      query: "COMMIT;",
      values: [],
    });

    return NextResponse.json({ success: true, assignmentId });
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { error: "Failed to insert assignment data" },
      { status: 500 }
    );
  }
}
