import {
  Code,
  Flex,
  ListItem,
  OrderedList,
  useColorModeValue,
} from "@chakra-ui/react";
import { useAuth } from "@frontegg/react";
import React from "react";
import { Link } from "react-router-dom";
import { useRecoilState } from "recoil";

import CodeBlock from "../../components/CodeBlock";
import TextLink from "../../components/TextLink";
import { currentEnvironment } from "../../recoil/environments";
import ConnectStepBoxDetail from "./ConnectStepBoxDetail";

const ConnectSteps = (): JSX.Element => {
  const { user } = useAuth();
  const [current, _] = useRecoilState(currentEnvironment);
  const environmentdAddress = current?.environmentd_pgwire_address;

  return (
    <Flex flexDir={{ base: "column-reverse", xl: "row" }}>
      <OrderedList spacing="6" type="a" flex="1">
        <ListItem>
          In your terminal, enter:
          <CodeBlock
            contents={`psql "postgres://${encodeURIComponent(
              user.email
            )}@${environmentdAddress}/materialize"`}
          />
        </ListItem>
        <ListItem>
          Paste in your app-specific password when prompted. If you don&apos;t
          have one yet you can{" "}
          <Link to="/access">
            <TextLink>generate one here</TextLink>!
          </Link>
        </ListItem>
        <ListItem>
          Try out <Code>SHOW CLUSTERS;</Code> and{" "}
          <TextLink
            href="https://materialize.com/docs/unstable/get-started/"
            target="_blank"
            rel="noopener noreferrer"
          >
            get started
          </TextLink>
          !
        </ListItem>
      </OrderedList>
      {environmentdAddress && (
        <HostInfo
          environmentdAddress={environmentdAddress}
          email={user.email}
        />
      )}
    </Flex>
  );
};

type HostInfoProps = {
  environmentdAddress: string;
  email: string;
};

const HostInfo = ({ environmentdAddress, email }: HostInfoProps) => {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  return (
    <Flex
      flexDirection={{ base: "row", xl: "column" }}
      justifyContent={{ base: "center", xl: "flex-start" }}
      flexWrap="wrap"
      gap={{ base: 8, xl: 1 }}
      ml={{ base: 0, xl: 4 }}
      mb={{ base: 4, xl: 0 }}
      pt={{ base: 3, xl: 4 }}
      pb={{ base: 2, xl: 4 }}
      px={{ base: 8, xl: 6 }}
      bg={bgColor}
    >
      <ConnectStepBoxDetail
        content={environmentdAddress.split(":")[0]}
        header="Host"
      />
      <ConnectStepBoxDetail
        content={environmentdAddress.split(":")[1]}
        header="Port"
      />
      <ConnectStepBoxDetail content={email} header="User" />
      <ConnectStepBoxDetail content="materialize" header="Database" />
    </Flex>
  );
};

export default ConnectSteps;
