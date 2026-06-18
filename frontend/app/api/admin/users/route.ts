import { NextResponse } from "next/server";

import { auth } from "@/auth";

const getBackendUrl = () => process.env.BACKEND_URL || "http://duolingo-backend:4000";

const backendHeaders = () => ({
  ...(process.env.BACKEND_API_KEY
    ? { "x-backend-api-key": process.env.BACKEND_API_KEY }
    : {}),
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${getBackendUrl()}/admin/users`, {
    headers: backendHeaders(),
    cache: "no-store",
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
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

  const response = await fetch(`${getBackendUrl()}/admin/users/${id}`, {
    method: "DELETE",
    headers: backendHeaders(),
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
