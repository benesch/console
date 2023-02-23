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
import React from "react";
import { Link } from "react-router-dom";

import { CopyableBox } from "~/components/copyableComponents";
import { MaterializeTheme } from "~/theme";
import useAppPasswords, {
  NEW_USER_DEFAULT_PASSWORD_NAME,
} from "~/useAppPasswords";

const PasswordStep = (props: BoxProps) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();

  const {
    addUserApiToken,
    loadingInProgress,
    createInProgress,
    tokensState,
    newPassword,
  } = useAppPasswords();

  let boxContents = (
    <Text color={semanticColors.foreground.secondary}>
      App passwords cannot be displayed after initial creation.
    </Text>
  );

  if (loadingInProgress) {
    boxContents = (
      <Flex alignItems="center" color={semanticColors.foreground.secondary}>
        <Spinner size="sm" mr={2} /> Loading...
      </Flex>
    );
  }

  if (createInProgress) {
    boxContents = (
      <Flex alignItems="center" color={semanticColors.foreground.secondary}>
        <Spinner size="sm" mr={2} /> Generating new app password...
      </Flex>
    );
  }

  if (newPassword) {
    boxContents = (
      <>
        <VStack alignItems="stretch">
          <Text
            as="span"
            fontSize="sm"
            lineHeight="16px"
            fontWeight={500}
            color={semanticColors.foreground.primary}
          >
            New app password:
          </Text>
          <CopyableBox contents={newPassword}>{newPassword}</CopyableBox>
        </VStack>
        <Text
          pt={3}
          fontSize="sm"
          lineHeight="20px"
          fontWeight={400}
          color={semanticColors.foreground.primary}
        >
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
      bg={semanticColors.background.primary}
      borderColor={semanticColors.border.primary}
      borderRadius="xl"
      {...props}
    >
      <HStack
        p={4}
        py={2}
        borderBottom="1px"
        borderColor={semanticColors.border.primary}
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
            isDisabled={
              !!(tokensState.successDialog.secret || createInProgress)
            }
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
