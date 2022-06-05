import {
  Alert,
  AlertIcon,
  Code,
  Flex,
  ListItem,
  OrderedList,
} from "@chakra-ui/react";
import { useAuth } from "@frontegg/react";
import React from "react";
import { useRecoilState } from "recoil";

import CodeBlock from "../../components/CodeBlock";
import TextLink from "../../components/TextLink";
import EnvironmentSelectField from "../../layouts/EnvironmentSelect";
import { currentEnvironment } from "../../recoil/currentEnvironment";
import ConnectStepBoxDetail from "./ConnectStepBoxDetail";

const ConnectSteps = (): JSX.Element => {
  const { user } = useAuth();
  const [current, _] = useRecoilState(currentEnvironment);
  const coorddAddress = current?.coordd_address;

  return coorddAddress ? (
    <Flex>
      <OrderedList spacing="6" type="a">
        <ListItem>
          In your terminal, enter:
          <CodeBlock
            contents={`psql "postgres://${encodeURIComponent(
              user.email
            )}@${coorddAddress}/materialize"`}
          />
          <Alert status="info" mt={2}>
            <AlertIcon />
            Deployments can take a few minutes. In the meantime follow the next
            steps!
          </Alert>
        </ListItem>
        <ListItem>
          Paste in your app-specific password when prompted. If you don&apos;t
          have one yet you can{" "}
          <TextLink href="/access">generate one here</TextLink>!
        </ListItem>
        <ListItem>
          Try out <Code>SHOW CLUSTERS;</Code> and{" "}
          <TextLink
            href="https://materialize.com/docs/get-started/"
            target="_blank"
            rel="noopener noreferrer"
          >
            get started
          </TextLink>
          !
        </ListItem>
      </OrderedList>
      <Flex
        flexFlow="column"
        flexWrap="wrap"
        paddingLeft="1rem"
        gap={1}
        overflow="hidden"
      >
        <ConnectStepBoxDetail
          content={coorddAddress.split(":")[0]}
          header="Host"
        />
        <ConnectStepBoxDetail
          content={coorddAddress.split(":")[1]}
          header="Port"
        />
        <ConnectStepBoxDetail content={user.email} header="User" />
        <ConnectStepBoxDetail content="materialize" header="Database" />
      </Flex>
    </Flex>
  ) : (
    <>
      <EnvironmentSelectField size="lg" />
    </>
  );
};

export default ConnectSteps;
