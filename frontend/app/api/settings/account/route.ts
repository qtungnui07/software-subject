import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  getAccount,
  updateAccount,
  type UpdateAccountInput,
} from "@/services/account-service";
import { setLocalSessionCookie } from "../../auth/local/_backend";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getAccount(session.user.id);

  return NextResponse.json(result.data, { status: result.status });
}

export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await updateAccount(
    session.user.id,
    (await req.json()) as UpdateAccountInput
  );
  const nextResponse = NextResponse.json(result.data, { status: result.status });

  if (
    result.ok &&
    result.data.account.isClerk === false
  ) {
    setLocalSessionCookie(nextResponse, {
      id: session.user.id,
      name: result.data.account.name,
      email: result.data.account.email,
      image: session.user.image || undefined,
    });
  }

  return nextResponse;
}
