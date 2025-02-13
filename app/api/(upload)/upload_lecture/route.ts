import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Extract data from the request body
    const { topic, desc, selectedCourses, fileLink } = await request.json();

    if (!topic || !desc || !(selectedCourses?.length > 0) || !fileLink) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Construct the SQL query dynamically
    let insert_query =
      "INSERT INTO course_material (m_topic, m_desc, m_upload_date, c_id, m_file) VALUES";
    let values: any[] = [];

    for (let i = 0; i < selectedCourses.length; i++) {
      if (i > 0) insert_query += ","; // Add a comma between values for multiple inserts
      insert_query += ` ($${i * 4 + 1}, $${i * 4 + 2}, CURRENT_TIMESTAMP, $${
        i * 4 + 3
      }, $${i * 4 + 4})`;

      values.push(topic, desc, selectedCourses[i], fileLink);
    }

    insert_query += ";"; // End the query

    // Execute the query
    const res = await query({
      query: insert_query,
      values,
    });

    return NextResponse.json({ success: true, result: res });
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { error: "Failed to insert lecture data" },
      { status: 500 }
    );
  }
}
