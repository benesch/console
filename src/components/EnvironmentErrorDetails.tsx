import { Text } from "@chakra-ui/react";
import { useFlags } from "launchdarkly-react-client-sdk";
import { ApiError } from "openapi-typescript-fetch";
import React from "react";

import { useAuth } from "~/api/auth";
import AlertBox, { AlertBoxProp } from "~/components/AlertBox";
import { useEnvironmentsWithHealth } from "~/recoil/environments";
import { isPollingDisabled } from "~/util";

const EnvironmentErrorDetails = (props: AlertBoxProp) => {
  const flags = useFlags();
  const { user } = useAuth();
  const environments = useEnvironmentsWithHealth(user.accessToken, {
    intervalMs: isPollingDisabled() ? undefined : 5000,
  });

  const showDetails = flags["layout-environment-health-details"];
  const envArray = Array.from(environments);
  if (envArray.every(([_, env]) => env.errors.length == 0)) {
    return null;
  }
  return (
    <AlertBox {...props}>
      {envArray.map(([name, env], i) => {
        return env.errors.map((error) => {
          return (
            <div key={i}>
              <Text
                opacity={showDetails ? 0.6 : 1}
                color="semanticColors.foreground.primary"
                key={i}
              >
                {" "}
                Error fetching environment health for {name}
              </Text>
              {showDetails && (
                <Text color="semanticColors.foreground.primary">
                  {error.message}
                  {error.details && (
                    <>
                      <div>
                        {error.details.name}: {error.details.message}
                      </div>
                      {error.details instanceof ApiError && (
                        <>
                          <div>Status: {error.details.status}</div>
                          <div>Url: {error.details.url}</div>
                        </>
                      )}
                    </>
                  )}
                </Text>
              )}
            </div>
          );
        });
      })}
    </AlertBox>
  );
};

export default EnvironmentErrorDetails;
