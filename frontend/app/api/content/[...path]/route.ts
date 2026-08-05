import { NextResponse } from "next/server";

import { backendRequest } from "@/services/backend-client";

export const dynamic = "force-dynamic";

const resolveBackendPath = (
  path: string[],
  request: Request,
): `/${string}` => {
  const sourceUrl = new URL(request.url);
  const suffix = path.map(encodeURIComponent).join("/");
  const params = new URLSearchParams(sourceUrl.searchParams);

  // The browser-facing proxy must never expose exercise answer keys. Server
  // services call the authenticated backend directly when grading is needed.
  params.delete("includeAnswers");

  const query = params.toString();
  return `/content/${suffix}${query ? `?${query}` : ""}`;
};

const respond = (result: Awaited<ReturnType<typeof backendRequest>>) =>
  NextResponse.json(result.data, { status: result.status });

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return respond(
    await backendRequest(resolveBackendPath(path, request), {
      method: "GET",
      cache: "no-store",
    }),
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const isExerciseCheckRoute =
    path.length === 3 &&
    path[0] === "exercises" &&
    Boolean(path[1]) &&
    path[2] === "check";

  if (!isExerciseCheckRoute) {
    return NextResponse.json(
      { error: "Content mutations are not available through this endpoint." },
      { status: 405 },
    );
  }
  const body = await request.json().catch(() => ({}));
  return respond(
    await backendRequest(resolveBackendPath(path, request), {
      method: "POST",
      body,
      cache: "no-store",
    }),
  );
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const body = await request.json().catch(() => ({}));
  return respond(
    await backendRequest(resolveBackendPath(path, request), {
      method: "PUT",
      body,
      cache: "no-store",
    }),
  );
}
