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

import { useAuth } from "../api/auth";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../components/cardComponents";
import { CopyButton } from "../components/Copyable";
import { SubmitButton, TextField } from "../components/formComponents";
import { BaseLayout, PageHeader, PageHeading } from "../layouts/BaseLayout";
import DeleteKeyModal from "./DeleteKeyModal";

const AppPasswordsPage = () => {
  const [latestPassName, setLatestPassName] = React.useState("");
  const [latestDeletionId, setLatestDeletionId] = React.useState("");
  const { loadApiTokens, addUserApiToken } = useApiTokensActions();
  React.useEffect(() => {
    loadApiTokens();
  }, []);
  const tokensState = useApiTokensState();
  const loadingInProgress = tokensState.loaders.LOAD_API_TOKENS;
  const createInProgress = tokensState.loaders.ADD_API_TOKEN;

  const tokens = React.useMemo(() => {
    return tokensState.apiTokensDataUser;
  }, [tokensState.apiTokensDataUser]);

  const newPassword = React.useMemo(() => {
    if (createInProgress) {
      return "";
    }
    if (tokensState && tokensState.successDialog) {
      const { clientId, secret } = tokensState.successDialog;
      const formattedClientId = (clientId || "").replaceAll("-", "");
      const formattedSecret = (secret || "").replaceAll("-", "");
      return `${formattedClientId}${formattedSecret}`;
    }
    return "";
  }, [tokensState]);

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
    <BaseLayout>
      <PageHeader>
        <PageHeading>App-specific passwords</PageHeading>
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
          <HStack spacing="5" alignItems="top" display="flex">
            <VStack flex="1" spacing="5" minWidth="0">
              <PasswordsTable
                tokens={tokens}
                latestDeletionId={latestDeletionId}
                deleteCb={deleteCb}
              />
            </VStack>
            <VStack width="400px">
              <Card>
                <Formik
                  initialValues={{ name: "", tenantId: "personal" }}
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
    </BaseLayout>
  );
};

type TableKey = IApiTokensData & {
  tenantName?: string;
};

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
  const disabledBg = useColorModeValue("gray.50", "gray.800");
  const disabledColor = useColorModeValue("gray.500", "gray.500");
  return (
    <Card pt="2" px="0" pb="6" {...props}>
      {
        <Table borderRadius="xl">
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
                >
                  <Td>{token.description}</Td>
                  <Td>{user.name}</Td>
                  <Td>{format(new Date(token.createdAt), "yyyy/MM/dd")}</Td>
                  <Td>
                    <DeleteKeyModal
                      description={token.description}
                      clientId={token.clientId}
                      tenantName={token.tenantName}
                      disabled={isDeleting}
                      deleteCb={deleteCb}
                    />
                  </Td>
                </Tr>
              );
            })}
            {tokens.length === 0 && (
              <Tr>
                <Td colSpan={4}>No app-specific passwords yet.</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      }
    </Card>
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
            Write this down; you will not be able to see your app-specific
            password again after you reload!
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
