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

    // Construct SQL query dynamically for multiple courses
    let insert_query = `INSERT INTO assignment (at_topic, at_desc, at_upload_date, at_due_date, c_id, at_file) VALUES `;
    let values: any[] = [];
    let placeholders: string[] = [];

    selectedCourses.forEach((courseId: string, index: number) => {
      const baseIndex = index * 5;
      placeholders.push(
        `($${baseIndex + 1}, $${baseIndex + 2}, CURRENT_TIMESTAMP, $${
          baseIndex + 3
        }, $${baseIndex + 4}, $${baseIndex + 5})`
      );
      values.push(topic, desc, dueDate, courseId, fileLink || null);
    });

    insert_query += placeholders.join(", ") + ";";

    // Execute the query
    const res = await query({ query: insert_query, values });

    return NextResponse.json({ success: true, result: res });
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { error: "Failed to insert assignment data" },
      { status: 500 }
    );
  }
}
