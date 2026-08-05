import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { cache } from "react";

import { LOCAL_SESSION_COOKIE } from "@/lib/local-session";
import { syncClerkUser } from "@/services/auth-service";
import { getValidLocalSessionUser } from "@/services/local-session-service";
import { getRemoteApiUrl } from "@/lib/remote-api";
import { resolveUserAvatar } from "@/constants/user-avatar";
import { getProfile } from "@/services/profile-service";

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
    imageSrc: resolveUserAvatar(user.imageUrl),
    createIfMissing: false,
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
          image: resolveUserAvatar(localUser.image),
        },
      };
    }

    const { userId } = await clerkAuth();
    if (!userId) return null;

    // Clerk verifies the session, while PostgreSQL remains the fast source of
    // truth for users that have already been synchronized. This avoids a
    // Clerk API round-trip and a database update on every protected request.
    const persistedProfile = await getProfile(userId).catch(() => null);
    if (persistedProfile?.ok) {
      return {
        user: {
          id: userId,
          name: persistedProfile.data.profile.name,
          email: persistedProfile.data.profile.email,
          image: resolveUserAvatar(persistedProfile.data.profile.imageSrc),
        },
      };
    }

    // Link an existing email account to Clerk, but never create a database
    // account from a sign-in request. Account creation belongs to sign-up.
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
        image: resolveUserAvatar(user?.imageUrl),
      },
    };
  } catch (error) {
    console.error("Error in Clerk auth bridge:", error);
    return null;
  }
});
