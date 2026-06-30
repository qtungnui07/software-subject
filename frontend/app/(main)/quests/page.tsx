import {
  defaultQuestSnapshotPreset,
  questSnapshotPresets,
  type QuestSnapshotPresetName,
} from "@/constants/quests";
import { getQuestsPageData } from "@/lib/quests";
import { getIntegratedQuestsPageData } from "@/lib/quests/quest-integration";
import type { QuestDemoState } from "@/types/quest";

import { QuestsClient } from "./quests-client";

export const dynamic = "force-dynamic";

type QuestsPageProps = {
  searchParams?: Promise<{
    state?: string | string[];
    preset?: string | string[];
  }>;
};

const getSingleParam = (value?: string | string[]) => {
  return Array.isArray(value) ? value[0] : value;
};

const getDemoState = (state?: string | string[]): QuestDemoState => {
  const value = getSingleParam(state);

  if (value === "loading" || value === "empty" || value === "error") {
    return value;
  }

  return "normal";
};

const getPresetName = (preset?: string | string[]): QuestSnapshotPresetName => {
  const value = getSingleParam(preset);

  if (value && value in questSnapshotPresets) {
    return value as QuestSnapshotPresetName;
  }

  return defaultQuestSnapshotPreset;
};

const QuestsPage = async ({ searchParams }: QuestsPageProps) => {
  const params = searchParams ? await searchParams : undefined;
  const presetName = getPresetName(params?.preset);
  const hasPresetOverride = Boolean(getSingleParam(params?.preset));
  const questsData = hasPresetOverride
    ? await getQuestsPageData(presetName)
    : await getIntegratedQuestsPageData(presetName);

  return (
    <QuestsClient
      demoState={getDemoState(params?.state)}
      initialData={questsData}
      presetName={presetName}
    />
  );
};

export default QuestsPage;
