import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/db";
import { comparePassword, hashPassword } from "@/lib/passwordEncryption";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { a_id } = { a_id: searchParams.get("a_id") };

    const res = await query({
      query: `SELECT a_id, a_name, email, a_image FROM admin WHERE a_id = $1;`,
      values: [a_id],
    });

    return NextResponse.json(res[0]);
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin data" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { a_id } = { a_id: searchParams.get("a_id") };
  const { objectUrl } = await request.json();
  // const session = await getSession();
  try {
    // Update to store the reference to the profile picture into the student table
    await query({
      query: "UPDATE admin SET a_image = $1 WHERE a_id = $2",
      values: [objectUrl, a_id],
    });
    // if (session?.user) {
    //   session.user.image = objectUrl;
    // }
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
  const a_id = searchParams.get("a_id");
  // const session = await getSession();
  //   const { objectUrl } = await request.json();
  // console.log("s_id: ", s_id);
  try {
    // Update to store the reference to the profile picture into the student table
    await query({
      query: "UPDATE admin SET a_image = NULL WHERE a_id = $1",
      values: [a_id],
    });
    // if (session?.user) {
    //   session.user.image = null;
    // }
    // console.log("Deleted from database");
    return NextResponse.json({ code: 1 });
  } catch (e) {
    return NextResponse.json({
      code: 0,
      message: e instanceof Error ? e.message : e?.toString(),
    });
  }
}

export async function PATCH(req: NextRequest) {
  const { a_id, oldPassword, newPassword } = await req.json();

  const res = await query({
    query: "SELECT DISTINCT * FROM admin WHERE a_id = $1",
    values: [a_id],
  });

  const isCorrectPassword: boolean = await comparePassword(
    oldPassword,
    res[0].password
  );
  if (!isCorrectPassword) {
    return NextResponse.json(
      { message: "Wrong Old Password" },
      { status: 401 }
    );
  }

  const newHashedPassword = await hashPassword(newPassword);

  if (res[0]) {
    await query({
      query: "UPDATE admin SET password = $1 WHERE a_id = $2",
      values: [newHashedPassword, a_id],
    });

    return NextResponse.json(true);
  }

  return NextResponse.json(false);
}
