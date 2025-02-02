import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { a_id, attendance } = await request.json();

    if (!a_id) {
      return NextResponse.json(
        { error: "Attendance ID is required" },
        { status: 400 }
      );
    }

    if (attendance) {
        return NextResponse.json(
            { error: "Attendance is required" },
            { status: 400 }
          );
    }

    let myQuery =
      "INSERT INTO mark_attendance (s_id, a_id, attendance_state) VALUES";

    for (const x in attendance) {
      myQuery += "(";
      myQuery += `'${x}',${a_id},${attendance[x]}`;
      myQuery += "),";
    }

    myQuery = myQuery.slice(0, myQuery.length - 1);
    const res = await query({
      query: myQuery,
      values: [],
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
