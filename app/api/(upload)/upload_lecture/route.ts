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

    await query({
      query: "BEGIN;",
      values: [],
    });

    // Construct the SQL query dynamically
    const lectureInsertQuery = `INSERT INTO course_material (m_topic, m_desc, m_upload_date, m_file)
       VALUES ($1, $2, CURRENT_TIMESTAMP, $3) RETURNING at_id;
      `;
    const lectureValues = [topic, desc, fileLink || null];
    const lectureResult = await query({
      query: lectureInsertQuery,
      values: lectureValues,
    });

    if (!lectureResult || lectureResult.length === 0) {
      throw new Error("Failed to insert assignment");
    }

    const lectureId = lectureResult[0].m_id;

    // Insert course relations into the lecture_course table
    const courseInsertQuery =
      `
      INSERT INTO lecture_course (m_id, c_id) VALUES ` +
      selectedCourses.map((index: number) => `($1, $${index + 2})`).join(", ") +
      `;`;

    const courseValues = [lectureId, ...selectedCourses];
    await query({ query: courseInsertQuery, values: courseValues });

    await query({
      query: "COMMIT;",
      values: [],
    });

    return NextResponse.json({ success: true, lectureId });
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { error: "Failed to insert lecture data" },
      { status: 500 }
    );
  }
}
