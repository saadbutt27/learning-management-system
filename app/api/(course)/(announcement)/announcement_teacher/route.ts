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
        { status: 500 }
      );
    }

    const res = await query({
      query: `SELECT an_id, an_topic as topic, an_desc as description, an_upload_date as upload_date FROM course_announcement WHERE c_id = $1; `,
      values: [c_id],
    });
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements data" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { an_id, topic, description } = await request.json();
    console.log(an_id, topic, description);
    if (!an_id) {
      return NextResponse.json(
        { error: "Announcement ID is required" },
        { status: 400 }
      );
    }
    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }
    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }
    const res = await query({
      query: `UPDATE course_announcement SET an_topic = $1, an_desc = $2 WHERE an_id = $3 RETURNING an_topic, an_desc;`,
      values: [topic, description, an_id],
    });

    if (res.length > 0) {
      return NextResponse.json({ updated_topic: res[0].an_topic, updated_description: res[0].an_desc });
    } else {
      return NextResponse.json(
        { error: "Announcement not found or no changes made" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error in PATCH request:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const an_id = searchParams.get("an_id");

    if (!an_id) {
      return NextResponse.json(
        { error: "Announcement ID is required" },
        { status: 400 }
      );
    }

    await query({
      query: `DELETE FROM course_announcement WHERE an_id = $1;`,
      values: [an_id],
    });

    return NextResponse.json({ code: 1 });
  } catch (error) {
    console.error("Error in DELETE request:", error);
    return NextResponse.json(
      { error: "Failed to delete annoucement" },
      { status: 500 }
    );
  }
}
