import postgres from "postgres";

import {
  DEFAULT_USER_AVATAR,
  LEGACY_USER_AVATARS,
} from "@/constants/user-avatar";

const databaseUrl = process.env.DATABASE_URL?.trim();
const applyChanges = process.argv.includes("--apply");

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to inspect or apply the Robogo avatar migration.");
}

const sql = postgres(databaseUrl, { max: 1 });
const legacyAvatars = [...LEGACY_USER_AVATARS];

const main = async () => {
  const [usersCount] = await sql<{ count: number }[]>`
    select count(*)::int as count
    from users
    where image_src is null
       or btrim(image_src) = ''
       or image_src in ${sql(legacyAvatars)}
  `;

  const [progressCount] = await sql<{ count: number }[]>`
    select count(*)::int as count
    from user_progress
    where user_image_src is null
       or btrim(user_image_src) = ''
       or user_image_src in ${sql(legacyAvatars)}
  `;

  console.log(
    `Robogo avatar migration preview: ${usersCount.count} users row(s), ${progressCount.count} user_progress row(s).`,
  );

  if (!applyChanges) {
    console.log("Dry run only. Re-run with --apply to update the database.");
    return;
  }

  await sql.begin(async (tx) => {
    await tx`alter table users alter column image_src set default ${DEFAULT_USER_AVATAR}`;
    await tx`alter table user_progress alter column user_image_src set default ${DEFAULT_USER_AVATAR}`;

    await tx`
      update users
      set image_src = ${DEFAULT_USER_AVATAR},
          updated_at = now()
      where image_src is null
         or btrim(image_src) = ''
         or image_src in ${tx(legacyAvatars)}
    `;

    await tx`
      update user_progress
      set user_image_src = ${DEFAULT_USER_AVATAR}
      where user_image_src is null
         or btrim(user_image_src) = ''
         or user_image_src in ${tx(legacyAvatars)}
    `;
  });

  console.log("Robogo avatar migration applied successfully.");
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end({ timeout: 5 });
  });
