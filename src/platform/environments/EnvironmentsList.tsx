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
import React, { useState } from "react";
import { useRecoilState } from "recoil";

import { SupportedCloudRegion, useCloudProvidersList } from "../../api/backend";
import { useEnvironmentsList } from "../../api/environment-controller";
import { useSql } from "../../api/materialized";
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
import { currentEnvironment } from "../../recoil/currentEnvironment";
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
  /**
   * States
   */
  const { user } = useAuth();
  const { data: environments, refetch } = useEnvironmentsList({
    base: props.region.environmentControllerUrl,
  });
  const [current] = useRecoilState(currentEnvironment);
  const [destroying, setDestroying] = useState<boolean>(false);

  // Simple SQL state used as a way to monitor instance status
  const { data, refetch: refetchSql } = useSql("SELECT 1");
  const negativeHealth = !data || data.rows.length === 0;

  /**
   * Hydrate state
   */
  useInterval(() => {
    refetch();
    refetchSql();
  }, 5000);

  /**
   * Vars
   */
  const isLoading = environments === null;
  const environment =
    !isLoading && environments?.length > 0 ? environments[0] : null;
  const allowEnabling = !isLoading && environment === null;

  let url;
  if (isLoading) {
    url = <Spinner />;
  } else if (environment && current !== null && destroying === false) {
    // _Current_ is populated in other part of the code outside the local scope. (inside useEnvironments())
    // The idea is to use current as a way to know when a environment is available for usqSql()
    if (negativeHealth) {
      url = <Text color="gray">Starting</Text>;
    } else {
      url = (
        <Code padding="1">
          <CopyableText fontSize="xs">
            {`postgres://${encodeURIComponent(user.email)}@${
              environment.coordd_address
            }/materialize`}
          </CopyableText>
        </Code>
      );
    }
  } else {
    url = <Text color="gray">Not enabled</Text>;
  }

  /**
   * Handlers
   */
  const handleDidDelete = () => {
    setDestroying(true);
  };

  const handleRegionEnabled = () => {
    setDestroying(false);
  };

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
            handleRegionEnabled={handleRegionEnabled}
          />
        )}
        {environment && (
          <DestroyEnvironmentModal
            region={props.region}
            size="sm"
            float="right"
            handleDidDelete={handleDidDelete}
          />
        )}
      </Td>
    </Tr>
  );
};

export default EnvironmentsListPage;
