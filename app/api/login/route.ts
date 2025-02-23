import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { signJwtAccessToken } from "@/lib/jwt";
import { comparePassword } from "@/lib/passwordEncryption";

export async function POST(request: NextRequest) {
  const { userId, password } = await request.json();
  if (!userId || !password)
    return NextResponse.json({ message: "missing required data" });

  let role;
  let res;

  if (userId.startsWith("tc")) {
    res = await query({
      query: "select distinct * from teacher where t_id = $1",
      values: [userId],
    });
    role = "teacher";
  } else if (userId.startsWith("st")) {
    res = await query({
      query: "select distinct * from student where s_id = $1",
      values: [userId],
    });
    role = "student";
  } else {
    res = await query({
      query: "select distinct * from admin where id = $1",
      values: [userId],
    });
    role = "admin";
  }

  const userExist = res.length;

  if (!userExist) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const isCorrectPassword: boolean = await comparePassword(
    password,
    res[0].password
  );
  if (!isCorrectPassword) {
    return NextResponse.json({ message: "Wrong Password" }, { status: 401 });
  }

  const { ...userWithoutPass } = res[0];
  const accessToken = signJwtAccessToken(userWithoutPass);
  const result = {
    ...userWithoutPass,
    accessToken,
    role,
  };
  return NextResponse.json(result);
}
