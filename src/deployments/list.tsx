/**
 * @module
 * Deployment list view.
 */

import {
  Alert,
  AlertIcon,
  Box,
  Heading,
  Image,
  Link,
  Spacer,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useInterval,
  VStack,
} from "@chakra-ui/react";
import { useAuth } from "@frontegg/react";
import React from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";

import cloudOutline from "../../img/cloud-outline.svg";
import {
  Deployment,
  useDeploymentsList,
  useOrganizationsRetrieve,
} from "../api/api";
import {
  BaseLayout,
  PageBreadcrumbs,
  PageHeader,
  PageHeading,
} from "../layouts/base";
import { CreateDeploymentButton } from "./create";
import { DeploymentStateBadge } from "./util";

export function DeploymentListPage() {
  const { user } = useAuth();
  const { data: deployments, refetch } = useDeploymentsList({});
  const { data: organization } = useOrganizationsRetrieve({
    id: user.tenantId,
  });
  useInterval(refetch, 5000);

  let deploymentsView;
  let canCreateDeployments = null;
  if (deployments === null || organization === null) {
    deploymentsView = <Spinner />;
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
        <PageHeading>Deployments</PageHeading>
        <Spacer />
        <CreateDeploymentButton
          refetch={refetch}
          isDisabled={!canCreateDeployments}
          size="sm"
        />
      </PageHeader>
      {canCreateDeployments === false && <DeploymentLimitWarning />}
      {deploymentsView}
    </BaseLayout>
  );
}

function DeploymentLimitWarning() {
  return (
    <Alert status="warning" mb="5">
      <AlertIcon />
      <Text>
        You've reached your deployment limit.{" "}
        <Link href="mailto:support@materialize.com" color="purple">
          Contact us
        </Link>{" "}
        to increase your limit.
      </Text>
    </Alert>
  );
}

function EmptyDeploymentList() {
  return (
    <VStack
      border="1px dashed #472f85"
      borderRadius="4px"
      minHeight="600px"
      alignItems="center"
      justifyContent="center"
      spacing="5"
    >
      <Image src={cloudOutline}></Image>
      <Heading fontWeight="400" fontSize="2xl">
        No deployments yet.
      </Heading>
    </VStack>
  );
}

interface DeploymentTableProps {
  deployments: Deployment[];
}

function DeploymentTable(props: DeploymentTableProps) {
  const history = useHistory();
  return (
    <>
      <Box borderWidth="1px" bg="white" borderRadius="sm">
        <Table data-testid="deployments-table">
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
              let trProps = {};
              if (!d.flaggedForDeletion) {
                trProps = {
                  cursor: "pointer",
                  _hover: { background: "gray.100" },
                  onClick: () => history.push(`/deployments/${d.id}`),
                };
              }
              return (
                <Tr {...trProps}>
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
      </Box>
    </>
  );
}
