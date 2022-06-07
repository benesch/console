import {
  Alert,
  AlertIcon,
  Box,
  Code,
  Flex,
  LinkBox,
  LinkOverlay,
  ListItem,
  OrderedList,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useAuth } from "@frontegg/react";
import React from "react";
import { Link } from "react-router-dom";
import { useRecoilState } from "recoil";

import { Card, CardContent, CardHeader } from "../../components/cardComponents";
import CodeBlock from "../../components/CodeBlock";
import TextLink from "../../components/TextLink";
import EnvironmentSelectField from "../../layouts/EnvironmentSelect";
import { currentEnvironment } from "../../recoil/currentEnvironment";
import ConnectStepBoxDetail from "./ConnectStepBoxDetail";
import useEnvironmentState from "./useEnvironmentState";

const ConnectSteps = (): JSX.Element => {
  const { user } = useAuth();
  const [current, _] = useRecoilState(currentEnvironment);
  const coorddAddress = current?.coordd_address;
  const { state: environmentState } = useEnvironmentState(
    current?.environmentControllerUrl
  );

  if (environmentState === "Not enabled") {
    return (
      <Box textAlign="center">
        <EnvironmentSelectField size="lg" margin="auto" />
      </Box>
    );
  }

  if (environmentState === "Loading" || environmentState === "Starting") {
    return (
      <Flex flexFlow="column">
        <Alert
          status="info"
          rounded="md"
          width="fit-content"
          px={4}
          margin="auto"
          marginTop={14}
        >
          <AlertIcon />
          Deployments can take a few minutes. In the meantime follow the next
          steps!
        </Alert>
        <Box py={20} margin="auto" width="100%">
          <Flex flexFlow="row">
            <Card>
              <LinkBox as="article">
                <LinkOverlay href="/access">
                  <CardHeader>1. Create a password</CardHeader>
                  <CardContent>
                    Passwords are now available! Click here to generate one
                  </CardContent>
                </LinkOverlay>
              </LinkBox>
            </Card>
            <Card marginLeft={10}>
              <LinkBox as="article">
                <LinkOverlay href="https://materialize.com/docs/quickstarts/">
                  <CardHeader>2. Check our quickstarts</CardHeader>
                  <CardContent>
                    Our demos can help you turn your ideas into something real
                    faster!
                  </CardContent>
                </LinkOverlay>
              </LinkBox>
            </Card>
            <Card marginLeft={10}>
              <LinkBox as="article">
                <LinkOverlay href="https://materialize.com/blog">
                  <CardHeader>3. Check our latests blogs</CardHeader>
                  <CardContent>
                    Stay up to date with our latest updates and releases!
                  </CardContent>
                </LinkOverlay>
              </LinkBox>
            </Card>
          </Flex>
        </Box>

        <Flex textAlign="center" alignItems="center" margin="auto">
          Looking for help?
          <LinkBox
            width="fit-content"
            display="flex"
            padding={4}
            rounded="md"
            as="button"
            bottom={0}
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 21 21"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4.31717 13.238C4.31717 14.4012 3.37517 15.3432 2.21199 15.3432C1.04881 15.3432 0.106812 14.4012 0.106812 13.238C0.106812 12.0748 1.04881 11.1328 2.21199 11.1328H4.31717V13.238Z"></path>
              <path d="M5.37042 13.238C5.37042 12.0748 6.31242 11.1328 7.4756 11.1328C8.63878 11.1328 9.58078 12.0748 9.58078 13.238V18.5017C9.58078 19.6649 8.63878 20.6069 7.4756 20.6069C6.31242 20.6069 5.37042 19.6649 5.37042 18.5017V13.238Z"></path>
              <path d="M7.4756 4.81729C6.31242 4.81729 5.37042 3.87529 5.37042 2.71211C5.37042 1.54893 6.31242 0.606934 7.4756 0.606934C8.63878 0.606934 9.58078 1.54893 9.58078 2.71211V4.81729H7.4756Z"></path>
              <path d="M7.47574 5.87061C8.63891 5.87061 9.58091 6.81261 9.58091 7.97578C9.58091 9.13896 8.63891 10.081 7.47574 10.081H2.21199C1.04881 10.081 0.106812 9.13737 0.106812 7.97578C0.106812 6.8142 1.04881 5.87061 2.21199 5.87061H7.47574Z"></path>
              <path d="M15.8955 7.97578C15.8955 6.81261 16.8375 5.87061 18.0007 5.87061C19.1639 5.87061 20.1059 6.81261 20.1059 7.97578C20.1059 9.13896 19.1639 10.081 18.0007 10.081H15.8955V7.97578Z"></path>
              <path d="M14.8423 7.97586C14.8423 9.13904 13.9003 10.081 12.7372 10.081C11.574 10.081 10.632 9.13904 10.632 7.97586V2.71211C10.632 1.54893 11.574 0.606934 12.7372 0.606934C13.9003 0.606934 14.8423 1.54893 14.8423 2.71211V7.97586Z"></path>
              <path d="M12.7371 16.3967C13.9003 16.3967 14.8423 17.3387 14.8423 18.5019C14.8423 19.6651 13.9003 20.6071 12.7371 20.6071C11.574 20.6071 10.632 19.6651 10.632 18.5019V16.3967H12.7371Z"></path>
              <path d="M12.7372 15.3432C11.574 15.3432 10.632 14.4012 10.632 13.238C10.632 12.0748 11.574 11.1328 12.7372 11.1328H18.0009C19.1641 11.1328 20.1061 12.0748 20.1061 13.238C20.1061 14.4012 19.1641 15.3432 18.0009 15.3432H12.7372Z"></path>
            </svg>
            <Text className="inline-on-desktop" marginLeft={1}>
              <b>Join the Community</b>
            </Text>
          </LinkBox>
        </Flex>
      </Flex>
    );
  }
  return (
    <Card>
      <CardHeader>Connect</CardHeader>
      <CardContent>
        <Flex flexDir={{ base: "column-reverse", xl: "row" }}>
          <OrderedList spacing="6" type="a" flex="1">
            <ListItem>
              In your terminal, enter:
              <CodeBlock
                contents={`psql "postgres://${encodeURIComponent(
                  user.email
                )}@${coorddAddress}/materialize"`}
              />
            </ListItem>
            <ListItem>
              Paste in your app-specific password when prompted. If you
              don&apos;t have one yet you can{" "}
              <Link to="/access">
                <TextLink>generate one here</TextLink>!
              </Link>
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
          {coorddAddress && (
            <HostInfo coorddAddress={coorddAddress} email={user.email} />
          )}
        </Flex>
      </CardContent>
    </Card>
  );
};

type HostInfoProps = {
  coorddAddress: string;
  email: string;
};

const HostInfo = ({ coorddAddress, email }: HostInfoProps) => {
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
        content={coorddAddress.split(":")[0]}
        header="Host"
      />
      <ConnectStepBoxDetail
        content={coorddAddress.split(":")[1]}
        header="Port"
      />
      <ConnectStepBoxDetail content={email} header="User" />
      <ConnectStepBoxDetail content="materialize" header="Database" />
    </Flex>
  );
};

export default ConnectSteps;
