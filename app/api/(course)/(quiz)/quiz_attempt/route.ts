import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { s_id, q_id, attempt, marks_obtained, total_marks } =
      await req.json();
    const accessToken = req.headers.get("authorization")?.split(" ")[1];

    if (!s_id) {
      console.log("s_id: ", s_id);
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }
    if (!q_id) {
      console.log("q_id: ", q_id);
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    // if (!attempt) {
    //   return NextResponse.json(
    //     { error: "Attempt field is required" },
    //     { status: 400 }
    //   );
    // }
    if (marks_obtained < 0) {
      return NextResponse.json(
        { error: "Obtained marks is required" },
        { status: 400 }
      );
    }
    if (!total_marks) {
      console.log("total_marks: ", total_marks);
      return NextResponse.json(
        { error: "Total marks is required" },
        { status: 400 }
      );
    }

    const decodedToken = jwt.decode(accessToken!) as jwt.JwtPayload;
    if (decodedToken?.s_id != s_id) {
      return NextResponse.json(
        { error: "Your are not eligible to access this page" },
        { status: 500 }
      );
    }

    await query({
      query: `INSERT INTO quiz_attempt VALUES ($1, $2, $3, $4, $5, NOW());`,
      values: [s_id, q_id, attempt, marks_obtained, total_marks],
    });

    return NextResponse.json(true);
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { error: "Failed to insert quiz attempt data" },
      { status: 500 }
    );
  }
}
