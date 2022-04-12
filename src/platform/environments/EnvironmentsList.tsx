import {
  Code,
  HStack,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useInterval,
} from "@chakra-ui/react";
import { useAuth } from "@frontegg/react";
import React from "react";

import { SupportedCloudRegion, useCloudProvidersList } from "../../api/backend";
import { useEnvironmentsList } from "../../api/environment-controller";
import { Card } from "../../components/cardComponents";
import { CopyableText } from "../../components/Copyable";
import {
  BaseLayout,
  PageBreadcrumbs,
  PageHeader,
} from "../../layouts/BaseLayout";
import {
  EmptyList,
  ListPageHeaderContent,
} from "../../layouts/listPageComponents";
import DestroyEnvironmentModal from "./DestroyEnvironmentModal";
import EnableEnvironmentModal from "./EnableEnvironmentModal";

const EnvironmentsListPage = () => {
  const { data: regions } = useCloudProvidersList({});
  const isLoading = regions === null;
  const isEmpty = !isLoading && regions.length === 0;
  return (
    <BaseLayout>
      <PageBreadcrumbs />
      <PageHeader>
        <HStack spacing={4} alignItems="center" justifyContent="flex-start">
          <ListPageHeaderContent title="Regions" />
        </HStack>
      </PageHeader>
      {isLoading && <Spinner data-testid="loading-spinner" />}
      {isEmpty && <EmptyList title="available regions" />}
      {!isLoading && !isEmpty && <EnvironmentTable regions={regions} />}
    </BaseLayout>
  );
};

interface EnvironmentTableProps {
  regions: SupportedCloudRegion[];
}

const EnvironmentTable = (props: EnvironmentTableProps) => {
  return (
    <Card pt="2" px="0" pb="6">
      {
        <Table data-testid="cluster-table" borderRadius="xl">
          <Thead>
            <Tr>
              <Th>Region</Th>
              <Th>URL</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {props.regions.map((r) => (
              <RegionEnvironmentRow
                key={r.environmentControllerUrl}
                region={r}
              />
            ))}
          </Tbody>
        </Table>
      }
    </Card>
  );
};

interface RegionEnvironmentRowProps {
  region: SupportedCloudRegion;
}

const RegionEnvironmentRow = (props: RegionEnvironmentRowProps) => {
  const { user } = useAuth();
  const { data: environments, refetch } = useEnvironmentsList({
    base: props.region.environmentControllerUrl,
  });
  useInterval(refetch, 5000);
  const isLoading = environments === null;
  const environment =
    !isLoading && environments?.length > 0 ? environments[0] : null;
  const allowEnabling = !isLoading && environment === null;

  let url;
  if (isLoading) {
    url = <Spinner />;
  } else if (environment) {
    url = (
      <Code padding="1">
        <CopyableText fontSize="xs">
          {`postgres://${encodeURIComponent(user.email)}@${
            environment.coordd_address
          }/materialize`}
        </CopyableText>
      </Code>
    );
  } else {
    url = <Text color="gray">Not enabled</Text>;
  }

  return (
    <Tr>
      <Td>
        {props.region.provider}/{props.region.region}
      </Td>
      <Td>{url}</Td>
      <Td>
        {allowEnabling && (
          <EnableEnvironmentModal
            refetch={refetch}
            region={props.region}
            size="sm"
            float="right"
          />
        )}
        {environment && (
          <DestroyEnvironmentModal
            region={props.region}
            size="sm"
            float="right"
          />
        )}
      </Td>
    </Tr>
  );
};

export default EnvironmentsListPage;
