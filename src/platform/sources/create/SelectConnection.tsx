import {
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
import IconNavLink from "~/components/IconNavLink";
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
                <IconNavLink
                  key={connection.id}
                  iconSource={connectionIcon(connection)}
                  width="100%"
                  to={`../${connection.type}?connectionId=${connection.id}`}
                >
                  {connection.name}
                </IconNavLink>
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
