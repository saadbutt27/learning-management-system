import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const a_id = searchParams.get("a_id");

    if (!a_id) {
      return NextResponse.json(
        { error: "Attendance ID is required" },
        { status: 400 }
      );
    }
    const res = await query({
      query:
        "SELECT ma.s_id, ma.attendance_state, s.s_name FROM mark_attendance ma JOIN student s ON s.s_id = ma.s_id WHERE a_id = $1;",
      values: [a_id],
    });

    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { error: "Failed to submit attendance" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { a_id, attendance, c_id } = await request.json();

    if (!a_id) {
      return NextResponse.json(
        { error: "Attendance ID is required" },
        { status: 400 }
      );
    }

    if (!attendance) {
      return NextResponse.json(
        { error: "Attendance is required" },
        { status: 400 }
      );
    }
    if (!c_id) {
      return NextResponse.json(
        { error: "Course  is required" },
        { status: 400 }
      );
    }

    let insertQuery =
      "INSERT INTO mark_attendance (s_id, a_id, attendance_state) VALUES ";

    for (const x in attendance) {
      insertQuery += "(";
      insertQuery += `'${x}',${a_id},${attendance[x]}`;
      insertQuery += "),";
    }

    insertQuery = insertQuery.slice(0, insertQuery.length - 1);

    await query({
      query: "BEGIN;",
      values: [],
    });
    await query({
      query: insertQuery,
      values: [],
    });
    await query({
      query:
        "UPDATE attendance SET is_marked = true where a_id = $1 AND c_id = $2;",
      values: [a_id, c_id],
    });
    await query({
      query: "COMMIT;",
      values: [],
    });

    return NextResponse.json({ message: "Attendance marked successfully" });
  } catch (error) {
    console.error("Error in POST request:", error);
    await query({
      query: "ROLLBACK",
      values: [],
    });
    return NextResponse.json(
      { error: "Failed to submit attendance" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { a_id, attendance } = await request.json();

    if (!a_id) {
      return NextResponse.json(
        { error: "Attendance ID is required" },
        { status: 400 }
      );
    }

    if (!attendance || Object.keys(attendance).length === 0) {
      return NextResponse.json(
        { error: "Attendance data is required" },
        { status: 400 }
      );
    }

    // Start transaction
    await query({ query: "BEGIN;", values: [] });

    // Construct dynamic SQL for updating mark_attendance
    let updateQuery = "UPDATE mark_attendance SET attendance_state = CASE ";
    const s_ids = [];  // To hold student IDs for the IN clause
    const values = []; // To hold parameter values for query binding
    let paramIndex = 1; // Parameter placeholders for SQL query

    for (const student of attendance) {
      const { s_id, attendance_state } = student;
      updateQuery += `WHEN s_id = $${paramIndex} THEN $${paramIndex + 1} `;
      s_ids.push(s_id);
      values.push(s_id, attendance_state); // Separate s_id and attendance_state
      paramIndex += 2;
    }

    // Add WHERE clause
    updateQuery += `ELSE attendance_state END WHERE a_id = $${paramIndex} AND s_id IN (${s_ids
      .map((_, index) => `$${index * 2 + 1}`)
      .join(", ")});`;

    // Push the attendance ID as the last value
    values.push(a_id);

    // Execute the update query
    await query({
      query: updateQuery,
      values: values,
    });


    // Commit the transaction
    await query({
      query: "COMMIT;",
      values: [],
    });

    return NextResponse.json({ message: "Attendance marked successfully" });
  } catch (error) {
    console.error("Error in PATCH request:", error);

    // Rollback transaction on error
    await query({
      query: "ROLLBACK;",
      values: [],
    });

    return NextResponse.json(
      { error: "Failed to submit attendance" },
      { status: 500 }
    );
  }
}
