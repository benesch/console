import { useEffect, useState } from "react";

import { GlobalConfig } from "../types";
import GAAnalyticsClient from "./googleAnalytics";
import SegmentAnalyticsClient from "./segment";
import { AnalyticsClient } from "./types";

function useAnalyticsClients({
  config,
  clients,
}: {
  config?: GlobalConfig;
  clients?: AnalyticsClient[];
}) {
  const clientList = clients || [];
  const [allClients, setAllClients] = useState<AnalyticsClient[]>(clientList);

  useEffect(() => {
    const newClientList = [];
    if (config) {
      newClientList.push(new GAAnalyticsClient(config));
      newClientList.push(new SegmentAnalyticsClient(config));
    }
    setAllClients(allClients.concat(newClientList));
  }, []);

  return allClients;
}

export default useAnalyticsClients;
