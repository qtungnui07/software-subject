import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "app/(main)/courses/page.tsx",
      "db/**/*.ts",
      "lib/db.ts",
      "services/quest-service.ts",
      "services/xp-service.ts",
    ],
    rules: {
      // These database adapters intentionally bridge dynamic Drizzle/mock results.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: [
      "app/(main)/admin/users.tsx",
      "app/(main)/learn/guide-dialog.tsx",
      "app/(marketing)/header-controls.tsx",
      "components/mobile-sidebar.tsx",
      "components/streak/streak-notification.tsx",
    ],
    rules: {
      // These effects synchronize client-only state after hydration or async IO.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["app/(marketing)/header-controls.tsx"],
    rules: {
      // Theme and locale controls intentionally synchronize document attributes.
      "react-hooks/immutability": "off",
    },
  },
  {
    files: ["test-db.js", "test_db_xp.js"],
    rules: {
      // Standalone database probes run directly as CommonJS scripts.
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-local/**",
    ".next.bad-permissions/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
