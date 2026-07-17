import { notFound } from "next/navigation";

import { SectionOneV2PreviewClient } from "@/app/dev/section-one-v2/section-one-v2-preview-client";

export default function SectionOneV2PreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <SectionOneV2PreviewClient />;
}
