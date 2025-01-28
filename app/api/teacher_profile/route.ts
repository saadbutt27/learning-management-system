import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "next-auth/react";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { t_id } = { t_id: searchParams.get("t_id") };

    const res = await query({
      query: "SELECT t_id, t_name, t_image FROM teacher WHERE t_id = $1;",
      values: [t_id!],
    });

    return NextResponse.json(res[0]);
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Failed to fetch student data" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { t_id } = { t_id: searchParams.get("t_id") };
  const { objectUrl } = await request.json();
  const session = await getSession();
  try {
    // Update to store the reference to the profile picture into the student table
    await query({
      query: "UPDATE teacher SET t_image = $1 WHERE t_id = $2",
      values: [objectUrl, t_id],
    });
    if (session?.user) {
      session.user.image = objectUrl;
    }
    return NextResponse.json({ code: 1 });
  } catch (e) {
    return NextResponse.json({
      code: 0,
      message: e instanceof Error ? e.message : e?.toString(),
    });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { t_id } = { t_id: searchParams.get("t_id") };
  const session = await getSession();
  //   const { objectUrl } = await request.json();
  try {
    // Update to store the reference to the profile picture into the student table
    await query({
      query: "UPDATE teacher SET t_image = null WHERE t_id = $1",
      values: [t_id],
    });
    if (session?.user) {
      session.user.image = null;
    }
    return NextResponse.json({ code: 1 });
  } catch (e) {
    return NextResponse.json({
      code: 0,
      message: e instanceof Error ? e.message : e?.toString(),
    });
  }
}

export async function PATCH(req: NextRequest) {
  const { t_id, oldPassword, newPassword } = await req.json();

  const res = await query({
    query: "SELECT DISTINCT * FROM teacher WHERE t_id = $1 AND password = $2",
    values: [t_id!, oldPassword!],
  });

  if (res[0]) {
    await query({
      query: "UPDATE teacher SET password = $1 WHERE s_id = $2",
      values: [newPassword!, t_id!],
    });

    return NextResponse.json(true);
  }

  return NextResponse.json(false);
}
