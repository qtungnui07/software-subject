import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  getProfile,
  updateProfile,
  type UpdateProfileInput,
} from "@/services/profile-service";
import { setLocalSessionCookie } from "../auth/local/_backend";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getProfile(session.user.id);

  return NextResponse.json(result.data, { status: result.status });
}

export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await updateProfile(
    session.user.id,
    (await req.json()) as UpdateProfileInput
  );
  const nextResponse = NextResponse.json(result.data, { status: result.status });

  if (
    result.ok &&
    !session.user.id.startsWith("user_") &&
    result.data.profile
  ) {
    await setLocalSessionCookie(nextResponse, {
      id: session.user.id,
      name: result.data.profile.name,
      email: result.data.profile.email || session.user.email || "",
      image: result.data.profile.imageSrc,
    });
  }

  return nextResponse;
}
