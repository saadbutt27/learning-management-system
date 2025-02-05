import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.headers.get("authorization")?.split(" ")[1];
    const { searchParams } = new URL(req.url);
    const t_id = searchParams.get("teacher_id");
    const c_id = searchParams.get("course_id");

    if (!t_id) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }
    if (!c_id) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const decodedToken = jwt.decode(accessToken!) as jwt.JwtPayload;
    if (decodedToken?.t_id != t_id) {
      return NextResponse.json(
        { error: "Your are not eligible to access this page" },
        { status: 401 }
      );
    }

    const res = await query({
      query: `SELECT a.at_topic as topic, a.at_id as assignment_id, a.at_desc as assignment_description, a.at_upload_date as upload_date, a.at_due_date as due_date, a.at_file as file
        FROM assignment a WHERE a.c_id = $1 ORDER BY a.at_due_date DESC;`,
      values: [c_id],
    });

    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments data" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { a_id, due_date } = await request.json();
    if (!a_id) {
      return NextResponse.json(
        { error: "Attendance ID is required" },
        { status: 400 }
      );
    }
    if (!due_date) {
      return NextResponse.json(
        { error: "Due date is required" },
        { status: 400 }
      );
    }
    const res = await query({
      query: `UPDATE assignment SET at_due_date = $1 where at_id = $2 RETURNING at_due_date;`,
      values: [due_date, a_id],
    });

    // The updated due_date will be in res.rows[0].at_due_date (if using pg for PostgreSQL)
    if (res.length > 0) {
      return NextResponse.json({ updated_due_date: res[0].at_due_date });
    } else {
      return NextResponse.json(
        { error: "Assignment not found or no changes made" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error in PATCH request:", error);
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const at_id = searchParams.get("at_id");

    if (!at_id) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    await query({
      query: `DELETE FROM assignment WHERE at_id = $1;`,
      values: [at_id],
    });

    return NextResponse.json({ code: 1 });
  } catch (error) {
    console.error("Error in DELETE request:", error);
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}
