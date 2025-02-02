import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

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
