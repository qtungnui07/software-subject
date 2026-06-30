import { QUEST_TIMEZONE } from "@/constants/quests";

const QUEST_STORAGE_KEY_PREFIX = "robogo:quests:v2";
const QUEST_STORAGE_SERVER_SNAPSHOT = "server";
const QUEST_STORAGE_CHANGE_EVENT = "robogo:quests-storage-change";

type QuestStorageState = {
  dateKey: string;
  claimedQuestIds: string[];
};

export const getTodayQuestDateKey = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: QUEST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date());
};

const getEmptyQuestStorageState = (): QuestStorageState => ({
  dateKey: getTodayQuestDateKey(),
  claimedQuestIds: [],
});

export const getQuestStorageKey = (dateKey = getTodayQuestDateKey()) => {
  return `${QUEST_STORAGE_KEY_PREFIX}:${dateKey}`;
};

const canUseLocalStorage = () => {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
};

const emitQuestStorageChange = () => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(QUEST_STORAGE_CHANGE_EVENT));
};

export const readQuestStorage = (): QuestStorageState => {
  if (!canUseLocalStorage()) {
    return getEmptyQuestStorageState();
  }

  try {
    const todayKey = getTodayQuestDateKey();
    const rawState = window.localStorage.getItem(getQuestStorageKey(todayKey));

    if (!rawState) {
      return getEmptyQuestStorageState();
    }

    const parsedState = JSON.parse(rawState) as Partial<QuestStorageState>;
    if (parsedState.dateKey !== todayKey) {
      return getEmptyQuestStorageState();
    }

    return {
      dateKey: todayKey,
      claimedQuestIds: Array.isArray(parsedState.claimedQuestIds)
        ? parsedState.claimedQuestIds.filter((id): id is string => typeof id === "string")
        : [],
    };
  } catch (error) {
    console.error("Failed to read Robogo quest storage:", error);
    return getEmptyQuestStorageState();
  }
};

export const writeQuestStorage = (state: QuestStorageState) => {
  if (!canUseLocalStorage()) return;

  window.localStorage.setItem(getQuestStorageKey(state.dateKey), JSON.stringify(state));
  emitQuestStorageChange();
};

export const getClaimedQuestIds = () => {
  return readQuestStorage().claimedQuestIds;
};

export const claimQuestInStorage = (questId: string) => {
  const state = readQuestStorage();
  const claimedQuestIds = Array.from(new Set([...state.claimedQuestIds, questId]));

  writeQuestStorage({
    ...state,
    claimedQuestIds,
  });

  return claimedQuestIds;
};

export const clearQuestStorage = () => {
  if (!canUseLocalStorage()) return;

  window.localStorage.removeItem(getQuestStorageKey());
  emitQuestStorageChange();
};

export const subscribeToQuestStorage = (onStoreChange: () => void) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(QUEST_STORAGE_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(QUEST_STORAGE_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
};

export const getQuestStorageSnapshot = () => {
  const state = readQuestStorage();
  const claimedQuestIds = [...state.claimedQuestIds].sort().join(",");

  return `${state.dateKey}:${claimedQuestIds}`;
};

export const getQuestServerSnapshot = () => QUEST_STORAGE_SERVER_SNAPSHOT;
