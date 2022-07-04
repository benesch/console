import { Button, Code, HStack, Spinner, Text, VStack } from "@chakra-ui/react";
import { useApiTokensActions, useApiTokensState } from "@frontegg/react";
import React, { useEffect } from "react";

import { PageBreadcrumbs } from "../../layouts/BaseLayout";

const CLI = () => {
  const { addUserApiToken } = useApiTokensActions();
  const tokensState = useApiTokensState();
  const createInProgress = tokensState.loaders.ADD_API_TOKEN;
  const tokenDescription = "Token for the CLI";

  /**
   * Redirect to the CLI server after the token is created.
   */
  useEffect(() => {
    const asyncRequest = async () => {
      try {
        const { clientId, secret } = tokensState.successDialog;
        console.log("Console: ", clientId, secret);
        if (clientId && secret) {
          const encodedSecret = encodeURIComponent(secret);
          const encodedClientId = encodeURIComponent(clientId);
          const encodedDescription = encodeURIComponent(tokenDescription);
          const url = `http://localhost:8808/?secret=${encodedSecret}&clientId=${encodedClientId}&description=${encodedDescription}`;

          window.location.assign(url);
        } else {
          // TODO: Set error
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (!createInProgress) {
      asyncRequest();
    }
  }, [createInProgress, tokensState]);

  const onYesClick = () => {
    addUserApiToken({
      description: tokenDescription,
    });
  };

  return (
    <>
      <PageBreadcrumbs />
      <VStack
        alignItems="flex-start"
        width="100%"
        height="100%"
        alignContent="center"
      >
        <VStack textAlign="center" marginX="auto" marginTop="8%">
          {createInProgress ? (
            <Spinner data-testid="loading-spinner" size="xl" />
          ) : (
            <>
              <Text fontSize="3xl">
                <b>You are about to create a password for the CLI.</b>
              </Text>
              <Text fontSize="3xl">Do you wish to continue?</Text>
              <HStack spacing={20} paddingTop={20}>
                <Button colorScheme="purple" size="lg" onClick={onYesClick}>
                  Yes
                </Button>
                <Button colorScheme="red" size="lg">
                  No
                </Button>
              </HStack>
              <Text fontSize="md" paddingTop={20} fontWeight={300}>
                The details will store in your configuration file:{" "}
                <Code>~/.config/mz/profiles.toml</Code>
              </Text>
            </>
          )}
        </VStack>
      </VStack>
    </>
  );
};

export default CLI;
