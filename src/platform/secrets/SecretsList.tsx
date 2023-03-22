import {
  Button,
  Circle,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useTheme,
} from "@chakra-ui/react";
import React from "react";

import { Secret, useSecrets } from "~/api/materialized";
import TextLink from "~/components/TextLink";
import { PageHeader, PageHeading } from "~/layouts/BaseLayout";
import {
  EmptyListHeader,
  EmptyListHeaderContents,
  EmptyListWrapper,
} from "~/layouts/listPageComponents";
import LockIcon from "~/svg/Lock";
import { MaterializeTheme } from "~/theme";

const EmptyState = () => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <EmptyListWrapper>
      <EmptyListHeader>
        <Circle p={2} bg={semanticColors.background.secondary}>
          <LockIcon />
        </Circle>
        <EmptyListHeaderContents
          title="No available secrets"
          helpText="Create a new secret to store sensitive information in Materialize."
        />
        <Text
          fontSize="xs"
          textAlign="center"
          color={semanticColors.foreground.secondary}
        >
          Need help?{" "}
          <TextLink
            href="//materialize.com/docs/sql/create-secret/"
            target="_blank"
          >
            View the documentation.
          </TextLink>
        </Text>
      </EmptyListHeader>
    </EmptyListWrapper>
  );
};

const SecretsList = () => {
  const { data: secrets } = useSecrets();

  const isLoading = secrets === null;

  const isEmpty = !isLoading && secrets.length === 0;

  return (
    <>
      <PageHeader>
        <PageHeading>Secrets</PageHeading>
        {/* TODO: Add handler for Secret creation flow(issue#17) */}
        <Button variant="primary" size="sm">
          New secret
        </Button>
      </PageHeader>
      {isLoading ? (
        <Spinner data-testid="loading-spinner" />
      ) : isEmpty ? (
        <EmptyState />
      ) : (
        <SecretsTable secrets={secrets} />
      )}
    </>
  );
};

type SecretsTableProps = {
  secrets: Secret[];
};

const SecretsTable = ({ secrets }: SecretsTableProps) => {
  const { colors } = useTheme<MaterializeTheme>();

  return (
    <Table variant="standalone">
      <Thead>
        <Tr>
          <Th>Name</Th>
        </Tr>
      </Thead>
      <Tbody>
        {secrets.map((secret) => {
          return (
            <Tr key={secret.id} textColor="default" aria-label={secret.name}>
              <Td
                borderBottomWidth="1px"
                borderBottomColor={colors.semanticColors.border.primary}
              >
                {secret.name}
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default SecretsList;
