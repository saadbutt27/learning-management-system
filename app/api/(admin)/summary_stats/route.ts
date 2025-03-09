// app/api/summary-stats/route.ts
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await query({
      query: "BEGIN;",
      values: [],
    });

    // Insert data into the course_teacher_assign table
    const totalStudentsQuery = `
        SELECT COUNT(*) FROM student;
      `;
    const totalStudents = await query({
      query: totalStudentsQuery,
      values: [],
    });

    const totalTeachersQuery = `
        SELECT COUNT(*) FROM teacher;
      `;
    const totalTeachers = await query({
      query: totalTeachersQuery,
      values: [],
    });

    const totalCoursesQuery = `
        SELECT COUNT(*) FROM teacher;
      `;
    const totalCourses = await query({ query: totalCoursesQuery, values: [] });

    //   if (!result || result.length === 0) {
    //     throw new Error("Failed to insert course");
    //   }

    await query({
      query: "COMMIT;",
      values: [],
    });

    const stats = {
      totalCourses: totalCourses[0].count,
      totalTeachers: totalTeachers[0].count,
      totalStudents: totalStudents[0].count,
    };

    return NextResponse.json({ success: true, stats: stats });
  } catch (error) {
    console.error("Error in GET request:", error);
    await query({ query: "ROLLBACK;", values: [] });
    return NextResponse.json(
      { error: "Failed to get statistics" },
      { status: 500 }
    );
  }
}
