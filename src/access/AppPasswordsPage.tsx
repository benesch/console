import {
  Alert,
  AlertDescription,
  BoxProps,
  CloseButton,
  HStack,
  Spacer,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useApiTokensActions, useApiTokensState } from "@frontegg/react";
import { IApiTokensData } from "@frontegg/redux-store";
import { format } from "date-fns";
import { Form, Formik } from "formik";
import React from "react";

import DeleteKeyModal from "~/access/DeleteKeyModal";
import { useAuth } from "~/api/auth";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/cardComponents";
import { CopyButton } from "~/components/copyableComponents";
import { SubmitButton, TextField } from "~/components/formComponents";
import { PageHeader, PageHeading } from "~/layouts/BaseLayout";
import { semanticColors } from "~/theme/colors";

const AppPasswordsPage = () => {
  const [latestPassName, setLatestPassName] = React.useState("");
  const [latestDeletionId, setLatestDeletionId] = React.useState("");
  const { loadUserApiTokens, addUserApiToken } = useApiTokensActions();
  React.useEffect(() => {
    loadUserApiTokens();
  }, [loadUserApiTokens]);
  const tokensState = useApiTokensState();
  const loadingInProgress = tokensState.loaders.LOAD_API_TOKENS;
  const createInProgress = tokensState.loaders.ADD_API_TOKEN;

  const newPassword = React.useMemo(() => {
    if (createInProgress) {
      return "";
    }
    if (tokensState.successDialog) {
      const { clientId, secret } = tokensState.successDialog;
      const formattedClientId = (clientId || "").replaceAll("-", "");
      const formattedSecret = (secret || "").replaceAll("-", "");
      return `mzp_${formattedClientId}${formattedSecret}`;
    }
    return "";
  }, [createInProgress, tokensState]);

  const deleteCb = (clientId: string) => {
    setLatestDeletionId(clientId);
    // if we're deleting the key we just made,
    // definitely don't show that key's creds anymore
    if (tokensState.successDialog.clientId === clientId) {
      setLatestPassName("");
    }
  };

  const closeSecretBox = () => {
    setLatestPassName("");
  };

  return (
    <>
      <PageHeader>
        <PageHeading>App passwords</PageHeading>
      </PageHeader>
      {loadingInProgress ? (
        <Spinner data-testid="loading-spinner" />
      ) : (
        <VStack alignItems="stretch">
          {latestPassName && newPassword && (
            <SecretBox
              name={latestPassName}
              password={newPassword}
              onClose={closeSecretBox}
            />
          )}
          <HStack spacing="5" alignItems="start" display="flex">
            <PasswordsTable
              tokens={tokensState.apiTokensDataUser}
              latestDeletionId={latestDeletionId}
              deleteCb={deleteCb}
            />
            <VStack width="400px">
              <Card>
                <Formik
                  initialValues={{ name: "" }}
                  onSubmit={(values, actions) => {
                    setLatestPassName(values.name);
                    addUserApiToken({ description: values.name });
                    actions.resetForm();
                  }}
                >
                  {(form) => (
                    <Form>
                      <CardHeader>Generate new password</CardHeader>
                      <CardContent>
                        <VStack pb={2}>
                          <TextField name="name" label="Name" size="sm" />
                        </VStack>
                      </CardContent>

                      <CardFooter>
                        <Spacer />
                        <SubmitButton
                          colorScheme="purple"
                          size="sm"
                          disabled={!!createInProgress || !form.values.name}
                        >
                          Submit
                        </SubmitButton>
                      </CardFooter>
                    </Form>
                  )}
                </Formik>
              </Card>
            </VStack>
          </HStack>
        </VStack>
      )}
    </>
  );
};

type TableKey = IApiTokensData;

type APIKeysTableProps = BoxProps & {
  tokens: TableKey[];
  latestDeletionId: string;
  deleteCb: (id: string) => void;
};

const PasswordsTable = ({
  tokens,
  latestDeletionId,
  deleteCb,
  ...props
}: APIKeysTableProps) => {
  const { user } = useAuth();
  const disabledBg = useColorModeValue("gray.100", "gray.800");
  const disabledColor = useColorModeValue("gray.500", "gray.500");
  const dividerColor = useColorModeValue(
    semanticColors.divider.light,
    semanticColors.divider.dark
  );

  return (
    <Table variant="borderless">
      <Thead>
        <Tr>
          <Th width="50%">Name</Th>
          <Th>Owner</Th>
          <Th>Created</Th>
          <Th />
        </Tr>
      </Thead>
      <Tbody>
        {tokens.map((token) => {
          const isDeleting = token.clientId === latestDeletionId;
          return (
            <Tr
              key={token.clientId}
              bg={isDeleting ? disabledBg : "default"}
              textColor={isDeleting ? disabledColor : "default"}
              aria-label={token.description}
            >
              <Td borderBottomWidth="1px" borderBottomColor={dividerColor}>
                {" "}
                {token.description}
              </Td>
              <Td borderBottomWidth="1px" borderBottomColor={dividerColor}>
                {" "}
                {user.name}
              </Td>
              <Td borderBottomWidth="1px" borderBottomColor={dividerColor}>
                {" "}
                {format(new Date(token.createdAt), "yyyy/MM/dd")}
              </Td>
              <Td borderBottomWidth="1px" borderBottomColor={dividerColor}>
                <DeleteKeyModal
                  description={token.description}
                  clientId={token.clientId}
                  disabled={isDeleting}
                  deleteCb={deleteCb}
                />
              </Td>
            </Tr>
          );
        })}
        {tokens.length === 0 && (
          <Tr>
            <Td colSpan={4}>No app passwords yet.</Td>
          </Tr>
        )}
      </Tbody>
    </Table>
  );
};

type SecretBoxProps = {
  name: string;
  password: string;
  onClose: () => void;
};

const SecretBox = ({ name, password, onClose }: SecretBoxProps) => {
  const keyBg = useColorModeValue("whiteAlpha.300", "whiteAlpha.100");
  const keyBorder = useColorModeValue("whiteAlpha.600", "whiteAlpha.300");
  return (
    <Alert status="info" mb={2} size="sm">
      <VStack alignItems="flex-start" width="100%">
        <AlertDescription width="100%" px={4}>
          <HStack alignItems="center">
            <Text>New password {`"${name}"`}:</Text>
            <HStack
              role="group"
              bg={keyBg}
              borderWidth="1px"
              borderColor={keyBorder}
              borderRadius={4}
              px={2}
              py={1}
            >
              <Text fontWeight="bold" aria-label="clientId">
                {password}
              </Text>
              <CopyButton
                contents={password || ""}
                top={0}
                right={0}
                position="relative"
                flex="0 0 auto"
              />
            </HStack>
          </HStack>
          <Text pt={3}>
            Write this down; you will not be able to see your app password again
            after you reload!
          </Text>
        </AlertDescription>
      </VStack>
      <CloseButton
        position="absolute"
        right={1}
        top={1}
        size="sm"
        onClick={onClose}
      />
    </Alert>
  );
};

export default AppPasswordsPage;
