export {};

const baseUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
const requireReady = process.env.REQUIRE_READY === "1";
const smokeLessonId = process.env.SMOKE_LESSON_ID ?? "en-s2-c1-lesson-1";
const requestTimeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? 15_000);

const request = async (path: string, init?: RequestInit) => {
  return fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    signal: AbortSignal.timeout(requestTimeoutMs),
    ...init,
  });
};

const assertStatus = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const assertBelowServerError = (path: string, status: number) => {
  assertStatus(status < 500, `${path} returned ${status}.`);
};

const main = async () => {
  const health = await request("/api/health");
  assertStatus(health.status === 200, `/api/health returned ${health.status}.`);
  const healthBody = (await health.json()) as { ok?: boolean; requestId?: string };
  assertStatus(healthBody.ok === true, "/api/health did not return ok=true.");
  assertStatus(Boolean(healthBody.requestId), "/api/health did not return requestId.");

  const ready = await request("/api/ready");
  assertStatus(
    requireReady ? ready.status === 200 : [200, 503].includes(ready.status),
    `/api/ready returned ${ready.status}.`,
  );

  const robogo = await request("/Robogo.svg");
  assertStatus(robogo.status === 200, `/Robogo.svg returned ${robogo.status}.`);
  assertStatus(
    (robogo.headers.get("content-type") ?? "").includes("image/svg+xml"),
    "/Robogo.svg did not return an SVG content type.",
  );

  const legacyMascotPath = "/mascot" + ".svg";
  const mascot = await request(legacyMascotPath);
  assertStatus(
    mascot.status === 404,
    `${legacyMascotPath} must stay removed, but returned ${mascot.status}.`,
  );

  const readOnlyRoutes = [
    "/learn",
    "/sections",
    `/lesson/${encodeURIComponent(smokeLessonId)}`,
    `/lesson?id=${encodeURIComponent(smokeLessonId)}`,
    "/learn?section=english-section-2",
    "/sections?requested=english-section-3",
  ];

  for (const path of readOnlyRoutes) {
    const response = await request(path);
    assertBelowServerError(path, response.status);
  }

  const anonymousSectionSelection = await request(
    "/api/progress/course/select-section",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sectionId: "english-section-2" }),
    },
  );
  assertStatus(
    anonymousSectionSelection.status === 401,
    `Anonymous section selection returned ${anonymousSectionSelection.status}.`,
  );

  console.log(
    `Course experience smoke test passed against ${baseUrl}: health/readiness, Robogo asset cleanup, protected learning routes, lesson routes, legacy section URLs, and anonymous section-selection protection are valid. No user progress was changed.`,
  );
};

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
