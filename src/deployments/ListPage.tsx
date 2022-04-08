/**
 * @module
 * Deployment list view.
 */

import {
  Alert,
  AlertIcon,
  HStack,
  Link,
  Spacer,
  Spinner,
  Table,
  TableRowProps,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useInterval,
} from "@chakra-ui/react";
import React from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";

import { useAuth } from "../api/auth";
import {
  Deployment,
  useDeploymentsList as useDeploymentListApi,
} from "../api/backend";
import { Card, CardContent } from "../components/cardComponents";
import SupportLink from "../components/SupportLink";
import { BaseLayout, PageBreadcrumbs, PageHeader } from "../layouts/BaseLayout";
import {
  EmptyList,
  ListFetchError,
  ListPageHeaderContent,
} from "../layouts/listPageComponents";
import useCache from "../utils/useCache";
import CreateDeploymentModal from "./create/CreateDeploymentModal";
import DeploymentStateBadge from "./DeploymentStateBadge";

const DeploymentListPage = () => {
  const { organization } = useAuth();
  const { deployments, refetch, error } = useDeploymentsList();

  const isLoading = !deployments || organization === null;
  const isEmpty = !isLoading && deployments.length === 0;
  const canCreateDeployments =
    isLoading || deployments.length < organization.deploymentLimit;
  // FIXME: add error handling and message to the user
  // FIXME: flatten the conditional branches by extracting returned components

  return (
    <BaseLayout>
      <PageBreadcrumbs />
      <PageHeader>
        <HStack spacing={4} alignItems="center" justifyContent="flex-start">
          <ListPageHeaderContent title="Deployments" />
        </HStack>
        {!!error && (
          <ListFetchError
            data-testid="fetch-deployment-issue-alert"
            message={`Failed to load list of deployments`}
          />
        )}
        <Spacer />
        <CreateDeploymentModal
          refetch={refetch}
          isDisabled={!canCreateDeployments}
          size="sm"
        />
      </PageHeader>
      {isLoading && <Spinner data-testid="loading-spinner" />}
      {isEmpty && <EmptyList title="deployments" />}
      {!canCreateDeployments && <DeploymentLimitWarning />}
      {!isLoading && !isEmpty && (
        <DeploymentTable deployments={deployments} />
      )}
    </BaseLayout>
  );
};

/** the hook managing data for the deployments list page
 * TODO: replace caching logic with `use-swr
 */
const useDeploymentsList = () => {
  const {
    data: deployments,
    refetch,
    loading,
    error,
  } = useDeploymentListApi({});

  const deploymentsLocalCopy = useCache(deployments);
  useInterval(refetch, 5000);

  return {
    deployments: deployments || deploymentsLocalCopy,
    error,
    loading,
    refetch,
  };
};

const DeploymentLimitWarning = () => {
  return (
    <Alert status="warning" mb="5">
      <AlertIcon />
      <Text>
        Deployment limit reached. Need more deployments?{" "}
        <SupportLink>Contact us.</SupportLink>
      </Text>
    </Alert>
  );
};

interface DeploymentTableProps {
  deployments: Deployment[];
}

const DeploymentTable = (props: DeploymentTableProps) => {
  const history = useHistory();
  const hoverBg = useColorModeValue("gray.50", "gray.900");
  return (
    <Card pt="2" px="0" pb="6">
      {
        <Table data-testid="deployments-table" borderRadius="xl">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th display={{ base: "none", md: "table-cell" }}>Hostname</Th>
              <Th>Size</Th>
              <Th display={{ base: "none", md: "table-cell" }}>Version</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {props.deployments.map((d) => {
              let trProps: TableRowProps = { key: d.id };
              if (!d.flaggedForDeletion) {
                trProps = {
                  ...trProps,
                  cursor: "pointer",
                  _hover: { background: hoverBg },
                  onClick: () => history.push(`/deployments/${d.id}`),
                };
              }

              return (
                <Tr key={d.id} data-testid="deployment-line" {...trProps}>
                  <Td width="50%">
                    {/* This link is for accessibility only, so we disable its
                      link styling, as the tr already has a hover state. */}
                    <Link
                      as={RouterLink}
                      to={`/deployments/${d.id}`}
                      _hover={{ textDecoration: "none" }}
                    >
                      {d.name}
                    </Link>
                  </Td>
                  <Td
                    display={{ base: "none", md: "table-cell" }}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {d.hostname}
                  </Td>
                  <Td style={{ whiteSpace: "nowrap" }}>{d.size}</Td>
                  <Td
                    display={{ base: "none", md: "table-cell" }}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {d.mzVersion}
                  </Td>
                  <Td style={{ whiteSpace: "nowrap" }}>
                    <DeploymentStateBadge deployment={d} />
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      }
      {props.deployments.length < 1 && (
        <CardContent px={6}>No matching deployments.</CardContent>
      )}
    </Card>
  );
};

export default DeploymentListPage;
