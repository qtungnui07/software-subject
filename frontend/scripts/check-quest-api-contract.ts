const BASE_URL = process.env.ROBOGO_QUEST_API_BASE_URL || "http://localhost:3000";

type ApiResponse = {
  status: number;
  body: string;
};

const request = async (path: string, init?: RequestInit): Promise<ApiResponse> => {
  const response = await fetch(`${BASE_URL}${path}`, init);
  const body = await response.text();

  return {
    status: response.status,
    body,
  };
};

const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) {
    throw new Error(message);
  }
};

const assertBodyIncludes = (body: string, pattern: string, label: string) => {
  assert(
    body.includes(pattern),
    `${label}: expected response body to include "${pattern}". Body: ${body}`,
  );
};

const main = async () => {
  const today = await request("/api/quests/today", {
    method: "GET",
  });

  assert(today.status === 200, `GET /api/quests/today expected 200, got ${today.status}.`);
  assertBodyIncludes(today.body, '"success":true', "today API");
  assertBodyIncludes(today.body, '"dailyCompleted":0', "today API");
  assertBodyIncludes(today.body, '"dailyTotal":3', "today API");
  assertBodyIncludes(today.body, '"chest"', "today API");

  const claim = await request("/api/quests/claim", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ questId: "daily-lesson-1" }),
  });

  assert(
    claim.status === 503,
    `POST /api/quests/claim without DATABASE_URL expected 503, got ${claim.status}.`,
  );
  assertBodyIncludes(claim.body, "QUEST_DATABASE_UNAVAILABLE", "daily quest claim API");

  const chest = await request("/api/quests/chest/claim", {
    method: "POST",
  });

  assert(
    chest.status === 503,
    `POST /api/quests/chest/claim without DATABASE_URL expected 503, got ${chest.status}.`,
  );
  assertBodyIncludes(chest.body, "QUEST_DATABASE_UNAVAILABLE", "chest claim API");

  console.log(
    "Quest API contract check passed: today=200, claim=503 without DB, chest=503 without DB.",
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
