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
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { isAdmin, useAuth } from "../../api/auth";
import { SupportedCloudRegion, useCloudProvidersList } from "../../api/backend";
import { useEnvironmentsList } from "../../api/environment-controller";
import { useSqlOnCoordinator } from "../../api/materialized";
import { Card } from "../../components/cardComponents";
import { CopyableText } from "../../components/Copyable";
import { PageBreadcrumbs, PageHeader } from "../../layouts/BaseLayout";
import {
  EmptyList,
  ListPageHeaderContent,
} from "../../layouts/listPageComponents";
import getDefaultEnvironment from "../../utils/platform";
import DestroyEnvironmentModal from "./DestroyEnvironmentModal";
import EnableEnvironmentModal from "./EnableEnvironmentModal";

const EnvironmentsListPage = () => {
  const { data: regions } = useCloudProvidersList({});
  const isLoading = regions === null;
  const isEmpty = !isLoading && regions.length === 0;
  return (
    <>
      <PageBreadcrumbs />
      <PageHeader>
        <HStack spacing={4} alignItems="center" justifyContent="flex-start">
          <ListPageHeaderContent title="Regions" />
        </HStack>
      </PageHeader>
      {isLoading && <Spinner data-testid="loading-spinner" />}
      {isEmpty && <EmptyList title="available regions" />}
      {!isLoading && !isEmpty && <EnvironmentTable regions={regions} />}
    </>
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
  const admin = isAdmin(user);
  const { data: environments, refetch } = useEnvironmentsList({
    base: props.region.environmentControllerUrl,
  });
  const environment = useMemo(
    () => getDefaultEnvironment(environments),
    [environments]
  );
  // It's useful to know that the useSql() has executed once
  // and results from query can be used.
  const [firstQuery, setFirstQuery] = useState<boolean>(true);

  // Simple SQL state used as a way to monitor instance status
  const {
    data,
    loading: loadingQuery,
    refetch: refetchSql,
  } = useSqlOnCoordinator("SELECT 1", environment);
  const negativeHealth = !data || data.rows.length === 0;

  const intervalCallback = useCallback(() => {
    refetch();
    if (environment) {
      refetchSql();
    }
  }, [refetch, refetchSql]);

  /**
   * Hydrate state
   */
  useInterval(intervalCallback, 5000);

  /**
   * Know when the first query to the environment is ran
   */
  useEffect(() => {
    if (firstQuery && environment && !loadingQuery) {
      setFirstQuery(false);
    }
  }, [loadingQuery]);

  /**
   * Vars
   */
  let url = <Text color="gray">Not enabled</Text>;

  if (environment && firstQuery) {
    url = <Spinner />;
  } else if (environment) {
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
  }

  return (
    <Tr>
      <Td>
        {props.region.provider}/{props.region.region}
      </Td>
      <Td>{url}</Td>
      <Td>
        {!environment && (
          <EnableEnvironmentModal
            refetch={refetch}
            region={props.region}
            size="sm"
            float="right"
            isAdmin={admin}
          />
        )}
        {environment && (
          <DestroyEnvironmentModal
            region={props.region}
            size="sm"
            float="right"
            isAdmin={admin}
          />
        )}
      </Td>
    </Tr>
  );
};

export default EnvironmentsListPage;
