export {};

const baseUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
const requireReady = process.env.REQUIRE_READY === "1";

const request = async (path: string, init?: RequestInit) => {
  return fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    ...init,
  });
};

const assertStatus = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
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

  for (const path of ["/onboarding", "/placement-test", "/learn"]) {
    const response = await request(path);
    assertStatus(response.status < 500, `${path} returned ${response.status}.`);
  }

  const completion = await request("/api/learning/complete", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      nodeId: "lesson-1",
      accuracy: 100,
      idempotencyKey: "00000000-0000-4000-8000-000000000000",
    }),
  });
  assertStatus(
    completion.status === 401,
    `Anonymous completion returned ${completion.status}.`,
  );

  console.log(
    `Adaptive learning smoke test passed against ${baseUrl}: health, readiness contract, public pages, and private completion access are valid.`,
  );
};

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
