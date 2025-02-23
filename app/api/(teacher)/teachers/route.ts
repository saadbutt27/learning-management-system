import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
      // Fetch all courses
      const res = await query({
        query: `SELECT t_id as id, t_name as name FROM teacher;`,
        values: [],
      });

      return NextResponse.json(res);
    
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Failed to fetch teachers data" },
      { status: 500 }
    );
  }
}
