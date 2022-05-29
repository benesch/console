import {
  Alert,
  AlertIcon,
  Code,
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

const ConnectSteps = (): JSX.Element => {
  const { user } = useAuth();
  const [current, _] = useRecoilState(currentEnvironment);

  return current ? (
    <OrderedList spacing="6">
      <ListItem>
        In your terminal, enter:
        <CodeBlock
          contents={`psql "postgres://${encodeURIComponent(user.email)}@${
            current?.coordd_address
          }/materialize"`}
        />
        <Alert status="info">
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
        <TextLink href="https://materialize.com/docs/get-started/">
          get started
        </TextLink>
        !
      </ListItem>
    </OrderedList>
  ) : (
    <>
      <EnvironmentSelectField />
    </>
  );
};

export default ConnectSteps;
