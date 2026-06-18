import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

import { LOCAL_SESSION_COOKIE, verifyLocalSessionToken } from "@/lib/local-session";

const syncUserToDatabase = async (user: NonNullable<Awaited<ReturnType<typeof currentUser>>>) => {
  const email = user.emailAddresses[0]?.emailAddress;
  const backendUrls = process.env.BACKEND_URL
    ? [process.env.BACKEND_URL]
    : ["http://duolingo-backend:4000", "http://127.0.0.1:4000"];

  if (!email) {
    return;
  }

  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username || "User";
  let lastError: unknown;

  for (const backendUrl of backendUrls) {
    try {
      const response = await fetch(`${backendUrl.replace(/\/$/, "")}/internal/users/sync`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(process.env.BACKEND_API_KEY
            ? { "x-backend-api-key": process.env.BACKEND_API_KEY }
            : {}),
        },
        body: JSON.stringify({
          clerkUserId: user.id,
          name,
          email,
          imageSrc: user.imageUrl || "/mascot.svg",
        }),
        signal: AbortSignal.timeout(2000),
      });

      if (response.ok) {
        return;
      }

      lastError = new Error(`Backend user sync failed with status ${response.status}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

export const auth = async () => {
  try {
    const cookieStore = await cookies();
    const localUser = verifyLocalSessionToken(cookieStore.get(LOCAL_SESSION_COOKIE)?.value);

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
};
