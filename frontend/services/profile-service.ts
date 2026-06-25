import "server-only";

import { backendRequest } from "@/services/backend-client";

export type Profile = {
  name: string;
  email: string;
  imageSrc: string;
  hearts: number;
  points: number;
  activeCourse: {
    id: number;
    title: string;
    imageSrc: string;
  } | null;
};

export type ProfileResponse = {
  ok: true;
  profile: Profile;
};

export type UpdateProfileInput = {
  name: string;
  imageSrc: string;
};

export const getProfile = (userId: string) =>
  backendRequest<ProfileResponse>("/profile", { userId });

export const updateProfile = (userId: string, input: UpdateProfileInput) =>
  backendRequest<ProfileResponse>("/profile", {
    method: "PATCH",
    userId,
    body: input,
  });

export const requireProfile = async (userId: string): Promise<Profile> => {
  const result = await getProfile(userId);

  if (!result.ok) {
    throw new Error(result.data.error);
  }

  return result.data.profile;
};
