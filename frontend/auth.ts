import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { cache } from "react";

import { LOCAL_SESSION_COOKIE } from "@/lib/local-session";
import { syncClerkUser } from "@/services/auth-service";
import { getValidLocalSessionUser } from "@/services/local-session-service";
import { getRemoteApiUrl } from "@/lib/remote-api";

const syncUserToDatabase = async (user: NonNullable<Awaited<ReturnType<typeof currentUser>>>) => {
  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) {
    return;
  }

  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username || "User";
  const result = await syncClerkUser({
    clerkUserId: user.id,
    name,
    email,
    imageSrc: user.imageUrl || "/mascot.svg",
  });

  if (!result.ok) {
    throw new Error(result.data.error);
  }
};

export const auth = cache(async () => {
  try {
    const cookieStore = await cookies();
    const remoteApiUrl = getRemoteApiUrl();

    if (remoteApiUrl) {
      const response = await fetch(`${remoteApiUrl}/frontend-api/api/auth/current`, {
        headers: { cookie: cookieStore.toString() },
        cache: "no-store",
      });
      const data = await response.json().catch(() => null);
      return response.ok && data?.user ? { user: data.user } : null;
    }

    const localUser = await getValidLocalSessionUser(
      cookieStore.get(LOCAL_SESSION_COOKIE)?.value
    );

    if (localUser) {
      return {
        user: {
          id: localUser.id,
          name: localUser.name,
          email: localUser.email,
          image: localUser.image || "/mascot.svg",
        },
      };
    }

    const { userId } = await clerkAuth();
    if (!userId) return null;

    const user = await currentUser();
    if (user) {
      try {
        await syncUserToDatabase(user);
      } catch (syncError) {
        console.error("Error syncing Clerk user to backend:", syncError);
      }
    }

    return {
      user: {
        id: userId,
        name: user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username || "User" : "User",
        email: user?.emailAddresses[0]?.emailAddress ?? "",
        image: user?.imageUrl ?? "",
      },
    };
  } catch (error) {
    console.error("Error in Clerk auth bridge:", error);
    return null;
  }
});
