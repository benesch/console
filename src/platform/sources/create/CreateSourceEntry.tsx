import {
  Button,
  Grid,
  GridItem,
  HStack,
  Image,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { Link, useParams } from "react-router-dom";

import {
  Connection,
  useConnectionsFiltered,
} from "~/api/materialize/connection/useConnections";
import ErrorBox from "~/components/ErrorBox";
import IconNavLink from "~/components/IconNavLink";
import SearchInput from "~/components/SearchInput";
import postgresLogo from "~/img/postgres-logo.svg";
import { PageHeading } from "~/layouts/BaseLayout";
import KafkaLogoIcon from "~/svg/KafkaLogoIcon";
import { useQueryStringState } from "~/useQueryString";

const connectionIcon = (connection: Connection) => {
  switch (connection.type) {
    case "kafka":
      return <KafkaLogoIcon height="6" width="6" />;
    case "postgres":
      return <Image height="6" width="6" src={postgresLogo} />;
    default:
      return null;
  }
};

const CreateSourceEntry = () => {
  const [nameFilter, setNameFilter] = useQueryStringState("connectionName");
  const {
    data: connections,
    error,
    loading,
  } = useConnectionsFiltered({ nameFilter });
  const { regionSlug } = useParams();

  if (error) {
    return <ErrorBox />;
  }
  return (
    <VStack mt="20" width="548px" alignSelf="center" spacing="6">
      <PageHeading mb="10" alignSelf="start">
        Choose a connection
      </PageHeading>
      <HStack width="100%">
        <SearchInput
          containerProps={{ width: "100%" }}
          onChange={(e) => setNameFilter(e.target.value)}
          value={nameFilter}
        />
        <Button
          as={Link}
          variant="primary"
          size="sm"
          minWidth="auto"
          to={`/regions/${regionSlug}/connections/new/connection`}
        >
          New connection
        </Button>
      </HStack>
      <Tabs width="100%">
        <TabList>
          <Tab>Data</Tab>
          <Tab>Network security</Tab>
        </TabList>
        <TabPanels>
          <TabPanel mt="8">
            <Grid gridTemplateColumns="minmax(0,1fr) minmax(0,1fr)" gridGap="4">
              {loading ? (
                <GridItem
                  display="flex"
                  justifyContent="center"
                  width="100%"
                  gridColumnEnd="span 2"
                >
                  <Spinner />
                </GridItem>
              ) : (
                connections?.map((connection) => (
                  <Tooltip
                    key={connection.id}
                    label={`${connection.databaseName}.${connection.schemaName}.${connection.name}`}
                    placement="top"
                    fontSize="xs"
                  >
                    <GridItem key={connection.id}>
                      <IconNavLink
                        icon={connectionIcon(connection)}
                        width="100%"
                        to={`../${connection.type}?connectionId=${connection.id}`}
                      >
                        {connection.name}
                      </IconNavLink>
                    </GridItem>
                  </Tooltip>
                ))
              )}
            </Grid>
          </TabPanel>
          <TabPanel></TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default CreateSourceEntry;
