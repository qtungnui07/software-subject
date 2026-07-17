const DEFAULT_USER_AVATAR = "/Robogo.svg";
const LEGACY_USER_AVATARS = new Set(["/mascot.svg", "mascot.svg"]);

const resolveUserAvatar = (imageSrc) => {
  const normalized = String(imageSrc || "").trim();

  if (!normalized || LEGACY_USER_AVATARS.has(normalized)) {
    return DEFAULT_USER_AVATAR;
  }

  return normalized;
};

module.exports = {
  DEFAULT_USER_AVATAR,
  LEGACY_USER_AVATARS,
  resolveUserAvatar,
};
