import { NextResponse } from "next/server";

import { signUpLocalUser, type SignUpInput } from "@/services/auth-service";
import { setLocalSessionCookie } from "../_backend";

export async function POST(req: Request) {
  const result = await signUpLocalUser((await req.json()) as SignUpInput);

  if (!result.ok) {
    return NextResponse.json(result.data, { status: result.status });
  }

  const nextResponse = NextResponse.json(result.data, { status: result.status });
  setLocalSessionCookie(nextResponse, result.data.user);

  return nextResponse;
}
