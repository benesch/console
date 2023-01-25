import {
  Box,
  BoxProps,
  Button,
  Flex,
  HStack,
  Spinner,
  Text,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import {
  useApiTokensActions,
  useApiTokensState,
  useAuth,
} from "@frontegg/react";
import React from "react";
import { Link } from "react-router-dom";

import { CopyableBox } from "~/components/copyableComponents";
import { MaterializeTheme } from "~/theme";

const NEW_USER_DEFAULT_PASSWORD_NAME = "App password";

const PasswordStep = (props: BoxProps) => {
  const { colors } = useTheme<MaterializeTheme>();

  const { user } = useAuth();
  const { loadUserApiTokens, addUserApiToken, resetApiTokensState } =
    useApiTokensActions();
  const tokensState = useApiTokensState();
  const loadingInProgress = tokensState.loaders.LOAD_API_TOKENS;
  const createInProgress = tokensState.loaders.ADD_API_TOKEN;

  React.useEffect(() => {
    loadUserApiTokens();
  }, [loadUserApiTokens]);
  React.useEffect(() => {
    resetApiTokensState();
    // Reset token state when switching orgs, otherwise we continue to display stale app passwords
  }, [resetApiTokensState, user?.tenantId]);
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
    <Text color={colors.semanticColors.foreground.secondary}>
      App passwords cannot be displayed after initial creation.
    </Text>
  );

  if (loadingInProgress) {
    boxContents = (
      <Flex
        alignItems="center"
        color={colors.semanticColors.foreground.secondary}
      >
        <Spinner size="sm" mr={2} /> Loading...
      </Flex>
    );
  }

  if (createInProgress) {
    boxContents = (
      <Flex
        alignItems="center"
        color={colors.semanticColors.foreground.secondary}
      >
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
          Copy this app password somewhere safe. App passwords cannot be
          displayed after initial creation!
        </Text>
      </>
    );
  }

  return (
    <VStack
      alignItems="stretch"
      spacing={2}
      border="1px"
      bg={colors.semanticColors.background.primary}
      borderColor={colors.semanticColors.border.primary}
      borderRadius="xl"
      {...props}
    >
      <HStack
        p={4}
        py={2}
        borderBottom="1px"
        borderColor={colors.semanticColors.border.primary}
      >
        <Text flex={1} fontWeight="500" fontSize="md">
          App passwords
        </Text>
        <HStack spacing={2}>
          <Link to="/access" target="_blank">
            <Button size="sm" variant="secondary">
              Manage app passwords
            </Button>
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
            size="sm"
            variant="primary"
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
