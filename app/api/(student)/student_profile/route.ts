import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/db";
import { comparePassword, hashPassword } from "@/lib/passwordEncryption";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { s_id } = { s_id: searchParams.get("s_id") };

    const res = await query({
      query: `SELECT 
          s.s_id, s.s_name, s.p_id, p.program_name, s.semester_num, s.s_image 
        FROM student s
        JOIN programs p ON s.p_id = p.p_id 
        WHERE s_id = $1;`,
      values: [s_id!],
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
  const { s_id } = { s_id: searchParams.get("s_id") };
  const { objectUrl } = await request.json();
  // const session = await getSession();
  try {
    // Update to store the reference to the profile picture into the student table
    await query({
      query: "UPDATE student SET s_image = $1 WHERE s_id = $2",
      values: [objectUrl, s_id],
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
  const s_id = searchParams.get("s_id");
  // const session = await getSession();
  //   const { objectUrl } = await request.json();
  // console.log("s_id: ", s_id);
  try {
    // Update to store the reference to the profile picture into the student table
    await query({
      query: "UPDATE student SET s_image = NULL WHERE s_id = $1",
      values: [s_id],
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
  const { s_id, oldPassword, newPassword } = await req.json();

  const res = await query({
    query: "SELECT DISTINCT * FROM student WHERE s_id = $1",
    values: [s_id],
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
      query: "UPDATE student SET password = $1 WHERE s_id = $2",
      values: [newHashedPassword, s_id],
    });

    return NextResponse.json(true);
  }

  return NextResponse.json(false);
}
