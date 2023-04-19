import {
  Box,
  Button,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from "@chakra-ui/react";
import React from "react";

import useConnections, { Connection } from "~/api/materialize/useConnections";
import SearchInput from "~/components/SearchInput";
import kafkaLogo from "~/img/kafka-logo.svg";
import postgresLogo from "~/img/postgres-logo.svg";
import { PageHeading } from "~/layouts/BaseLayout";

const connectionIcon = (connection: Connection) => {
  switch (connection.type) {
    case "kafka":
      return kafkaLogo;
    case "postgres":
      return postgresLogo;
    default:
      connection.type satisfies never;
  }
};

const SelectConnection = () => {
  const { data: connections } = useConnections();

  return (
    <VStack mt="20" width="548px" alignSelf="center" spacing="6">
      <PageHeading mb="10" alignSelf="start">
        Choose a connection
      </PageHeading>
      <HStack width="100%">
        <SearchInput containerProps={{ width: "100%" }} />
        <Button variant="primary" size="sm" minWidth="auto">
          New connection
        </Button>
      </HStack>
      <Tabs width="100%">
        <TabList>
          <Tab>Data</Tab>
          <Tab>Network security</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <HStack mt="8" spacing="6">
              {connections?.map((connection) => (
                <Button
                  key={connection.id}
                  variant="outline"
                  p="6"
                  height="auto"
                  width="100%"
                  justifyContent="left"
                >
                  <Box as="img" src={connectionIcon(connection)} mr="4" />
                  {connection.name}
                </Button>
              ))}
            </HStack>
          </TabPanel>
          <TabPanel></TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default SelectConnection;
