import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const a_id = searchParams.get("a_id");
    const t_id = searchParams.get("t_id");
    const c_id = searchParams.get("c_id");

    if (!a_id) {
      return NextResponse.json(
        { error: "Assignment id is required" },
        { status: 400 }
      );
    }
    if (!t_id) {
      return NextResponse.json(
        { error: "Teacher id is required" },
        { status: 400 }
      );
    }
    if (!c_id) {
      return NextResponse.json(
        { error: "Course id is required" },
        { status: 400 }
      );
    }

    const res = await query({
      query: `SELECT 
                s.s_id, 
                s.s_name, 
                ats.upload_date, 
                ats.assignment_file,
                ats.marks, 
                COALESCE(asm.total_marks, 0) AS total_marks,
                ats.at_id
            FROM student s
            JOIN enroll_assign e 
                ON s.s_id = e.s_id 
                AND e.c_id = $1
            LEFT JOIN assignment_submissions ats 
                ON s.s_id = ats.s_id 
                AND ats.at_id = $2
            LEFT JOIN assignment asm 
                ON asm.at_id = $2
            ORDER BY 
                ats.marks DESC NULLS LAST;
            `,
      values: [c_id, a_id],
    });
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempts data" },
      { status: 500 }
    );
  }
}

// PATCH request: Update marks for a student
export async function PATCH(req: NextRequest) {
  try {
    const { studentId, marks } = await req.json();

    if (!studentId || marks === null || marks === undefined) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const updateRes = await query({
      query: `UPDATE assignment_submissions SET marks = $1 WHERE s_id = $2 RETURNING marks, s_id;`,
      values: [marks, studentId],
    });

    console.log((updateRes));

    if (updateRes.length === 0) {
      return NextResponse.json({ error: "No records updated" }, { status: 404 });
    }

    return NextResponse.json({ message: "Marks updated successfully!" });
  } catch (error) {
    console.error("Error in PATCH request:", error);
    return NextResponse.json({ error: "Failed to update marks" }, { status: 500 });
  }
}