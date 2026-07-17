import { execSync } from "node:child_process";
import process from "node:process";

const API_BASE_URL =
  process.env.ROBOGO_QUEST_API_BASE_URL ??
  process.env.QUEST_API_BASE_URL ??
  "http://localhost:3000";
const REACT_SERVER_CONDITION = "--conditions react-server";

const withReactServerCondition = (nodeOptions: string | undefined) => {
  if (!nodeOptions?.trim()) return REACT_SERVER_CONDITION;

  if (nodeOptions.includes(REACT_SERVER_CONDITION)) {
    return nodeOptions;
  }

  return `${nodeOptions} ${REACT_SERVER_CONDITION}`;
};

const runScript = (
  label: string,
  scriptPath: string,
  options: { reactServer?: boolean } = {},
) => {
  console.log(`\n[quests-check] ${label}\n`);

  const env = {
    ...process.env,
    ROBOGO_QUEST_API_BASE_URL: API_BASE_URL,
    NODE_OPTIONS: options.reactServer
      ? withReactServerCondition(process.env.NODE_OPTIONS)
      : process.env.NODE_OPTIONS,
  };

  try {
    execSync(`npx tsx ${scriptPath}`, {
      cwd: process.cwd(),
      env,
      stdio: "inherit",
      windowsHide: true,
    });
  } catch (error) {
    console.error(`\n[quests-check] ${label} failed.`);

    if (error instanceof Error) {
      console.error(error.message);
    }

    process.exit(1);
  }
};

console.log(`[quests-check] API base: ${API_BASE_URL}`);
console.log("[quests-check] Make sure `npm run dev` is running before the API contract check.\n");

runScript("Quest reset countdown", "scripts/check-quest-reset-countdown.ts");

runScript("Quest pure logic", "scripts/check-quest-logic.ts", {
  reactServer: true,
});

runScript("Quest progress policy", "scripts/check-quest-progress-contract.ts", {
  reactServer: true,
});

runScript("Quest claim state", "scripts/check-quest-claim-state.ts");

runScript("Quest API contract", "scripts/check-quest-api-contract.ts");

console.log("\nQuest full check passed: countdown, logic, progress policy, claim state, and API contract are valid.");
