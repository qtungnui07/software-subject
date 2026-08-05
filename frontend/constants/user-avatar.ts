export const DEFAULT_USER_AVATAR = "/Robogo.svg";

export const LEGACY_USER_AVATARS = ["/mascot.svg", "mascot.svg"] as const;

export const resolveUserAvatar = (imageSrc?: string | null): string => {
  const normalized = imageSrc?.trim();

  if (!normalized || LEGACY_USER_AVATARS.includes(normalized as (typeof LEGACY_USER_AVATARS)[number])) {
    return DEFAULT_USER_AVATAR;
  }

  return normalized;
};

export const isSvgAvatar = (imageSrc?: string | null): boolean => {
  const resolved = resolveUserAvatar(imageSrc).toLowerCase();
  return resolved.endsWith(".svg") || resolved.includes("image/svg+xml");
};
