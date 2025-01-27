import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { signJwtAccessToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  const { userId, password } = await request.json();
  if (!userId || !password)
    return NextResponse.json({ message: "missing required data" });

  let role;
  let res;

  if (userId[0] === "t" && userId[1] === "c") {
    res = await query({
      query: "select distinct * from teacher where t_id = $1 and password = $2",
      values: [userId, password],
    });
    role = "teacher";
  } else {
    res = await query({
      query: "select distinct * from student where s_id = $1 and password = $2",
      values: [userId, password],
    });
    role = "student";
  }

  const userExist = res.length;

  if (!userExist) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
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
