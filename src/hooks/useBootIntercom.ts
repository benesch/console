import { useAuth as useFronteggAuth } from "@frontegg/react";
import { useFlags } from "launchdarkly-react-client-sdk";
import React from "react";
import { useIntercom } from "react-use-intercom";

const useBootIntercom = () => {
  const { boot, shutdown } = useIntercom();
  const { user } = useFronteggAuth();
  const flags = useFlags();

  const intercomEnabled = flags["intercom"];
  React.useEffect(() => {
    if (!intercomEnabled) return;
    if (!user) return;

    boot({
      email: user.email,
      name: user.name,
      userId: user.id,
      horizontalPadding: 24,
      verticalPadding: 48,
    });
    return () => {
      shutdown();
    };
  }, [boot, intercomEnabled, shutdown, user]);
};

export default useBootIntercom;
