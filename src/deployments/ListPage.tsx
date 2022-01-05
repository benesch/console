/**
 * @module
 * Deployment list view.
 */

import {
  Alert,
  AlertIcon,
  Heading,
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
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";

import {
  Deployment,
  useDeploymentsList as useDeploymentListApi,
} from "../api/api";
import { useAuth } from "../api/auth";
import { Card } from "../components/cardComponents";
import SupportLink from "../components/SupportLink";
import {
  BaseLayout,
  PageBreadcrumbs,
  PageHeader,
  PageHeading,
} from "../layouts/BaseLayout";
import CloudSvg from "../svg/CloudSvg";
import colors from "../theme/colors";
import useCache from "../utils/useCache";
import CreateDeploymentModal from "./create/CreateDeploymentModal";
import DeploymentStateBadge from "./DeploymentStateBadge";

const DeploymentListPage = () => {
  const { organization } = useAuth();
  const { deployments, refetch, error } = useDeploymentsList();

  let deploymentsView;
  let canCreateDeployments = null;
  // FIXME: add error handling and message to the user
  // FIXME: flatten the conditional branches by extracting returned components

  if (!deployments || organization === null) {
    deploymentsView = <Spinner data-testid="loading-spinner" />;
  } else {
    canCreateDeployments = deployments.length < organization.deploymentLimit;
    if (deployments.length === 0) {
      deploymentsView = <EmptyDeploymentList />;
    } else {
      deploymentsView = <DeploymentTable deployments={deployments} />;
    }
  }
  return (
    <BaseLayout>
      <PageBreadcrumbs></PageBreadcrumbs>
      <PageHeader>
        <HStack spacing={4} alignItems="center" justifyContent="flex-start">
          <PageHeading>Deployments</PageHeading>
          {error && <DeploymentListFetchErrorWarning />}
        </HStack>
        <Spacer />
        <CreateDeploymentModal
          refetch={refetch}
          isDisabled={!canCreateDeployments}
          size="sm"
        />
      </PageHeader>
      {canCreateDeployments === false && <DeploymentLimitWarning />}
      {deploymentsView}
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

const DeploymentListFetchErrorWarning: React.FC = () => {
  return (
    <Alert
      status="warning"
      p={1}
      px={2}
      data-testid="fetch-deployment-issue-alert"
    >
      <AlertIcon />
      <Text>Failed to load list of deployments</Text>
    </Alert>
  );
};

const EmptyDeploymentList = () => {
  const borderColor = useColorModeValue(colors.purple[600], colors.purple[400]);

  return (
    <VStack
      border={`1px dashed ${borderColor}`}
      borderRadius="4px"
      minHeight="600px"
      alignItems="center"
      justifyContent="center"
      spacing="5"
    >
      <CloudSvg />
      <Heading fontWeight="400" fontSize="2xl">
        No deployments yet.
      </Heading>
    </VStack>
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
      <Table data-testid="deployments-table" borderRadius="xl">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Hostname</Th>
            <Th>Size</Th>
            <Th>Version</Th>
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
                <Td>
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
                <Td>{d.hostname}</Td>
                <Td>{d.size}</Td>
                <Td>{d.mzVersion}</Td>
                <Td>
                  <DeploymentStateBadge deployment={d} />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Card>
  );
};

export default DeploymentListPage;
