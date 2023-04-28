import {
  Button,
  HStack,
  Image,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from "@chakra-ui/react";
import React from "react";

import {
  Connection,
  useConnectionsFiltered,
} from "~/api/materialize/useConnections";
import ErrorBox from "~/components/ErrorBox";
import IconNavLink from "~/components/IconNavLink";
import SearchInput from "~/components/SearchInput";
import postgresLogo from "~/img/postgres-logo.svg";
import { PageHeading } from "~/layouts/BaseLayout";
import KafkaLogoIcon from "~/svg/KafkaLogoIcon";

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
  const { data: connections, error } = useConnectionsFiltered();

  if (error) {
    return <ErrorBox />;
  }
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
                  icon={connectionIcon(connection)}
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

export default CreateSourceEntry;
