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

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

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

  assert(
    today.status === 401,
    `Anonymous GET /api/quests/today expected 401, got ${today.status}.`,
  );
  assertBodyIncludes(today.body, '"error":"Unauthorized"', "today API");

  const claim = await request("/api/quests/claim", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ questId: "daily-lesson-1" }),
  });

  assert(
    claim.status === 401,
    `Anonymous POST /api/quests/claim expected 401, got ${claim.status}.`,
  );
  assertBodyIncludes(claim.body, '"error":"Unauthorized"', "daily quest claim API");

  const chest = await request("/api/quests/chest/claim", {
    method: "POST",
  });

  assert(
    chest.status === 401,
    `Anonymous POST /api/quests/chest/claim expected 401, got ${chest.status}.`,
  );
  assertBodyIncludes(chest.body, '"error":"Unauthorized"', "chest claim API");

  console.log(
    "Quest API contract check passed: anonymous today, claim, and chest requests are rejected with 401.",
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
