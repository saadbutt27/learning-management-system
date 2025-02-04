import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const c_id = searchParams.get("c_id");

    if (!c_id) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const result = await query({
      query:
        "SELECT a_id, date_of_attendance, is_marked FROM attendance WHERE c_id = $1 ORDER BY date_of_attendance DESC",
      values: [c_id],
    });

    return NextResponse.json({ sessions: result });
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { date, c_id } = await request.json();
    await query({
      query: `INSERT INTO attendance (date_of_attendance,c_id) values($1,$2);`,
      values: [date, c_id],
    });
    const res = await query({
      query: "SELECT a_id FROM attendance ORDER BY a_id DESC LIMIT 1",
      values: [],
    });

    return NextResponse.json({ a_id: res[0].a_id });
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { a_id, c_id } = await request.json();
    if (!a_id) {
      return NextResponse.json(
        { error: "Attendance ID is required" },
        { status: 400 }
      );
    }
    if (!c_id) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }
    await query({
      query: `UPDATE attendance SET is_marked = true where a_id = $1 AND c_id = $2;`,
      values: [a_id, c_id],
    });

    return NextResponse.json({ code: 1 });
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
