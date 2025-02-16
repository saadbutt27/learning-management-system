import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Extract data from the request body
    const { topic, desc, selectedCourses, fileLink, url } =
      await request.json();

    // Validation: Check required fields
    if (!topic || !desc || !(selectedCourses?.length > 0)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await query({
      query: "BEGIN;",
      values: [],
    });

    // Insert announcement details into the announcement table
    const announcementInsertQuery = `
      INSERT INTO course_announcement (an_topic, an_desc, an_upload_date, file, link) 
      VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4) RETURNING an_id;
    `;
    const announcementValues = [topic, desc, fileLink, url || null];
    const announcementResult = await query({
      query: announcementInsertQuery,
      values: announcementValues,
    });

    if (!announcementResult || announcementResult.length === 0) {
      throw new Error("Failed to insert announcement");
    }

    const announcementId = announcementResult[0].an_id;

    // Insert course relations into the announcement_course table
    const courseInsertQuery =
      `
      INSERT INTO announcement_course (an_id, c_id) VALUES ` +
      selectedCourses.map((index: number) => `($1, $${index + 2})`).join(", ") +
      `;`;

    const courseValues = [announcementId, ...selectedCourses];
    await query({ query: courseInsertQuery, values: courseValues });

    await query({
      query: "COMMIT;",
      values: [],
    });

    return NextResponse.json({ success: true, announcementId });
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { error: "Failed to insert announcement data" },
      { status: 500 }
    );
  }
}
