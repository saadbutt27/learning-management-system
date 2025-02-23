import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Fetch all courses
    const res = await query({
      query: `SELECT p_id, program_name FROM programs;`,
      values: [],
    });

    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs data" },
      { status: 500 }
    );
  }
}
