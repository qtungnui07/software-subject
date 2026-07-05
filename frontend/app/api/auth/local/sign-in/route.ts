import { NextResponse } from "next/server";

import { signInLocalUser, type SignInInput } from "@/services/auth-service";
import { setLocalSessionCookie } from "../_backend";

export async function POST(req: Request) {
  const result = await signInLocalUser((await req.json()) as SignInInput);

  if (!result.ok) {
    return NextResponse.json(result.data, { status: result.status });
  }

  const nextResponse = NextResponse.json(result.data, { status: result.status });
  await setLocalSessionCookie(nextResponse, result.data.user);

  return nextResponse;
}
