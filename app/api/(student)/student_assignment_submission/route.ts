import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assignment_id = searchParams.get("assignment_id");
    const student_id = searchParams.get("student_id");

    if (!assignment_id || !student_id) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Check if the assignment submission exists
    const submission = await query({
      query: `
        SELECT assignment_file, upload_date, attempt, marks
        FROM assignment_submissions 
        WHERE at_id = $1 AND s_id = $2;
      `,
      values: [assignment_id, student_id],
    });

    // console.log(submission);

    return NextResponse.json(
      {
        submitted: !!submission?.length, // Ensures proper boolean conversion
        submission: submission?.[0], // Prevents errors if submission is null/undefined
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Extract data from the request body
    const { assignment_id, student_id, fileLink } = await request.json();

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

export async function PATCH(request: NextRequest) {
  try {
    const { assignment_id, student_id, fileLink } = await request.json();

    if (!assignment_id || !student_id || !fileLink) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updateQuery = `UPDATE assignment_submissions SET assignment_file = $1, upload_date = CURRENT_TIMESTAMP 
      WHERE at_id = $2 AND s_id = $3;`;
    const updateValues = [fileLink, assignment_id, student_id];

    const updateResult = await query({
      query: updateQuery,
      values: updateValues,
    });

    if (!updateResult) {
      return NextResponse.json(
        { error: "Failed to update assignment submission" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PATCH request:", error);
    return NextResponse.json(
      { error: "Failed to update assignment submission" },
      { status: 500 }
    );
  }
}
