import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { deleteUser, listUsers } from "@/services/admin-service";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await listUsers();

  return NextResponse.json(result.data, { status: result.status });
}

export async function DELETE(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  if (String(id) === session.user.id) {
    return NextResponse.json({ error: "You cannot delete the active account" }, { status: 400 });
  }

  const result = await deleteUser(String(id));

  return NextResponse.json(result.data, { status: result.status });
}
