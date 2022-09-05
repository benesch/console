import {
  Box,
  Flex,
  HStack,
  Select,
  Spinner,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useAuth } from "@frontegg/react";
import React, { ChangeEventHandler } from "react";
import { useRecoilState } from "recoil";

import CodeBlock from "../../components/CodeBlock";
import { currentEnvironment } from "../../recoil/environments";
import { semanticColors } from "../../theme/colors";
import ConnectStepBoxDetail from "./ConnectStepBoxDetail";

type ConnectionOption = "psql" | "other";

const ConnectSteps = (): JSX.Element => {
  const { user } = useAuth();
  const [current, _] = useRecoilState(currentEnvironment);
  const [connectionOption, setConnectionOption] =
    React.useState<ConnectionOption>("psql");
  const borderColor = useColorModeValue(
    semanticColors.divider.light,
    semanticColors.divider.dark
  );

  const environmentdAddress = current?.env?.environmentdPgwireAddress;

  const selectHandler: ChangeEventHandler<HTMLSelectElement> =
    React.useCallback((e) => {
      setConnectionOption(e.target.value as ConnectionOption);
    }, []);

  if (!user) {
    return <Spinner />;
  }

  // switch is pretty overkill atm, but someday there'll be more
  // pre-baked connection options
  let instructions;
  switch (connectionOption) {
    case "psql":
      instructions = (
        <CodeBlock
          contents={`psql "postgres://${encodeURIComponent(
            user.email
          )}@${environmentdAddress}/materialize"`}
        />
      );
      break;
    case "other":
      if (environmentdAddress) {
        instructions = (
          <HostInfo
            environmentdAddress={environmentdAddress}
            email={user.email}
          />
        );
      }
      break;
    default:
      throw new Error(`Unhandled connection option: ${connectionOption}`);
  }

  return environmentdAddress ? (
    <VStack
      alignItems="flex-start"
      flex="1"
      border="1px"
      borderColor={borderColor}
      borderRadius="xl"
      p={4}
    >
      <HStack mb={2}>
        <Box whiteSpace="nowrap">Connect via </Box>
        <Select
          aria-label="Connection option"
          onChange={selectHandler}
          defaultValue="psql"
        >
          <option value="psql">psql</option>
          <option value="other">external tool</option>
        </Select>
      </HStack>
      <Box pl={4} pb={4}>
        {instructions}
      </Box>
    </VStack>
  ) : (
    <Spinner />
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
      flexDirection="row"
      justifyContent="center"
      flexWrap="wrap"
      gap={{ base: 4, md: 8 }}
      pt={4}
      pb={4}
      px={8}
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
