import { Flex, Text, VStack } from "@chakra-ui/react";
import { useFlags } from "launchdarkly-react-client-sdk";
import { ApiError } from "openapi-typescript-fetch";
import React from "react";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import AlertBox from "~/components/AlertBox";
import {
  currentEnvironmentIdState,
  currentEnvironmentState,
  environmentErrors,
} from "~/recoil/environments";

import SupportLink from "./SupportLink";

export interface EnvironmentErrorProps {
  hideContentOnEnvironmentError: boolean;
  children: React.ReactNode;
}

const EnvironmentError = ({
  hideContentOnEnvironmentError,
  children,
}: EnvironmentErrorProps) => {
  const flags = useFlags();
  const currentEnvironmentId = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentIdState
  );
  const environment = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentState
  );

  const showDetails = flags["layout-environment-health-details"];
  const errors = environment ? environmentErrors(environment) : [];
  if (errors.length === 0) {
    return <>{children}</>;
  }
  return (
    <>
      <Flex flexDirection="column" alignItems="flex-start">
        <VStack w="100%" spacing={2} alignItems="center">
          <AlertBox p={4} marginTop={4}>
            <Text opacity={0.6} color="foreground.primary">
              We&apos;re having trouble connecting to your Materialize region{" "}
              {currentEnvironmentId}
            </Text>
            {showDetails &&
              errors.map((error, i) => {
                return (
                  <Text as="div" color="foreground.primary" key={i}>
                    {error.message}
                    {error.details && (
                      <>
                        <div>
                          {error.details.name}: {error.details.message}
                        </div>
                        {error.details instanceof ApiError && (
                          <>
                            <div>Status: {error.details.status}</div>
                            <div>URL: {error.details.url}</div>
                          </>
                        )}
                      </>
                    )}
                  </Text>
                );
              })}
            <Text>
              {environment?.state === "enabled" &&
                environment.resolvable &&
                "Double check that your internet connection is healthy. "}
              Visit our <SupportLink>help center</SupportLink> if the issue
              persists.
            </Text>
            <Text></Text>
          </AlertBox>
        </VStack>
      </Flex>
      {!hideContentOnEnvironmentError && children}
    </>
  );
};

export default EnvironmentError;
