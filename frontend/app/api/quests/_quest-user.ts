import { auth } from "@/auth";
import { resolveUserAvatar } from "@/constants/user-avatar";

export type CurrentQuestApiUser = {
  id: string;
  name: string;
  image: string;
};

export const getCurrentQuestApiUser = async (): Promise<CurrentQuestApiUser | null> => {
  const session = await auth().catch(() => null);

  if (session?.user?.id) {
    return {
      id: session.user.id,
      name: session.user.name || "User",
      image: resolveUserAvatar(session.user.image),
    };
  }

  return null;
};
