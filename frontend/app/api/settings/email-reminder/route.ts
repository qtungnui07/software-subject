import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  getEmailReminder,
  updateEmailReminder,
} from "@/services/email-reminder-service";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getEmailReminder(session.user.id);
  return NextResponse.json(result.data, { status: result.status });
}

export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { enabled: boolean; reminderTime: string };
  const result = await updateEmailReminder(session.user.id, body);
  return NextResponse.json(result.data, { status: result.status });
}
