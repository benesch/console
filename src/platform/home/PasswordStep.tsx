import {
  Box,
  BoxProps,
  Button,
  Flex,
  HStack,
  Spinner,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useApiTokensActions, useApiTokensState } from "@frontegg/react";
import React from "react";
import { Link } from "react-router-dom";

import { CopyableBox } from "../../components/copyableComponents";
import { semanticColors } from "../../theme/colors";

const NEW_USER_DEFAULT_PASSWORD_NAME = "App password";

const PasswordStep = (props: BoxProps) => {
  const bg = useColorModeValue(
    semanticColors.card.bg.light,
    semanticColors.card.bg.dark
  );
  const grayText = useColorModeValue(
    semanticColors.grayText.light,
    semanticColors.grayText.dark
  );
  const borderColor = useColorModeValue(
    semanticColors.divider.light,
    semanticColors.divider.dark
  );

  const { loadUserApiTokens, addUserApiToken } = useApiTokensActions();
  const tokensState = useApiTokensState();
  const loadingInProgress = tokensState.loaders.LOAD_API_TOKENS;
  const createInProgress = tokensState.loaders.ADD_API_TOKEN;

  React.useEffect(() => {
    loadUserApiTokens();
  }, [loadUserApiTokens]);
  React.useEffect(() => {
    if (
      loadingInProgress === false &&
      tokensState.apiTokensDataUser.length === 0
    ) {
      addUserApiToken({ description: NEW_USER_DEFAULT_PASSWORD_NAME });
    }
  }, [tokensState.apiTokensDataUser, loadingInProgress, addUserApiToken]);
  const newPassword = React.useMemo(() => {
    if (createInProgress) {
      return "";
    }
    if (tokensState.successDialog) {
      const { clientId, secret } = tokensState.successDialog;
      if (clientId && secret) {
        const formattedClientId = clientId.replaceAll("-", "");
        const formattedSecret = secret.replaceAll("-", "");
        return `mzp_${formattedClientId}${formattedSecret}`;
      }
    }
    return "";
  }, [createInProgress, tokensState]);

  let boxContents = (
    <Text color={grayText}>
      App passwords cannot be displayed after initial creation.
    </Text>
  );

  if (loadingInProgress) {
    boxContents = (
      <Flex alignItems="center" color={grayText}>
        <Spinner size="sm" mr={2} /> Loading...
      </Flex>
    );
  }

  if (createInProgress) {
    boxContents = (
      <Flex alignItems="center" color={grayText}>
        <Spinner size="sm" mr={2} /> Generating new app password...
      </Flex>
    );
  }

  if (tokensState.successDialog.secret) {
    boxContents = (
      <>
        <VStack alignItems="stretch">
          <Text as="span">New app password:</Text>
          <CopyableBox contents={newPassword}>{newPassword}</CopyableBox>
        </VStack>
        <Text pt={3} fontSize="sm">
          Copy this app password somewhere safe. App passwords{" "}
          <Text fontWeight="bold" as="span">
            cannot
          </Text>{" "}
          be displayed after initial creation!
        </Text>
      </>
    );
  }

  return (
    <VStack
      alignItems="stretch"
      spacing={2}
      border="1px"
      bg={bg}
      borderColor={borderColor}
      borderRadius="xl"
      {...props}
    >
      <HStack p={4} py={2} borderBottom="1px" borderColor={borderColor}>
        <Text flex={1} fontWeight="500" fontSize="md">
          App passwords
        </Text>
        <HStack spacing={2}>
          <Link to="/access" target="_blank">
            <Button size="sm">Manage app passwords</Button>
          </Link>
          <Button
            onClick={() =>
              addUserApiToken({
                description: `${NEW_USER_DEFAULT_PASSWORD_NAME} ${
                  tokensState.apiTokensDataUser.length + 1
                }`,
              })
            }
            disabled={!!(tokensState.successDialog.secret || createInProgress)}
            colorScheme="purple"
            size="sm"
          >
            Create new
          </Button>
        </HStack>
      </HStack>
      <Box p={4} pt={2}>
        {boxContents}
      </Box>
    </VStack>
  );
};

export default PasswordStep;
