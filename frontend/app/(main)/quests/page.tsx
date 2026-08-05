import { getIntegratedQuestsPageData } from "@/lib/quests/quest-integration";

import { QuestsClient } from "./quests-client";

export const dynamic = "force-dynamic";

const QuestsPage = async () => {
  const questsData = await getIntegratedQuestsPageData();

  return (
    <QuestsClient
      initialData={questsData}
    />
  );
};

export default QuestsPage;
