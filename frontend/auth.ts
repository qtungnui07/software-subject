import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";

export const auth = async () => {
  try {
    const { userId } = await clerkAuth();
    if (!userId) return null;

    const user = await currentUser();

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
