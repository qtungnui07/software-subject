import { auth } from "@/auth";

export type CurrentQuestApiUser = {
  id: string;
  name: string;
  image: string;
  isLocalFallback: boolean;
};

export const getCurrentQuestApiUser = async (): Promise<CurrentQuestApiUser | null> => {
  const session = await auth().catch(() => null);

  if (session?.user?.id) {
    return {
      id: session.user.id,
      name: session.user.name || "User",
      image: session.user.image || "/mascot.svg",
      isLocalFallback: false,
    };
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      id: process.env.LOCAL_QUEST_USER_ID || "local-quest-user",
      name: process.env.LOCAL_QUEST_USER_NAME || "Local Quest User",
      image: process.env.LOCAL_QUEST_USER_IMAGE || "/mascot.svg",
      isLocalFallback: true,
    };
  }

  return null;
};
