import { Spinner } from "@chakra-ui/react";
import { useAuth } from "@frontegg/react";
import React from "react";
import { useRecoilValue } from "recoil";

import { TabbedCodeBlock } from "~/components/copyableComponents";
import { currentEnvironmentState } from "~/recoil/environments";
import MonitorIcon from "~/svg/Monitor";
import TerminalIcon from "~/svg/Terminal";

const ConnectSteps = (): JSX.Element => {
  const { user } = useAuth();
  const currentEnvironment = useRecoilValue(currentEnvironmentState);

  if (!currentEnvironment || currentEnvironment.state !== "enabled" || !user) {
    return <Spinner />;
  }

  const environmentdAddress = currentEnvironment.environmentdPgwireAddress;

  // switch is pretty overkill atm, but someday there'll be more
  // pre-baked connection options
  const psqlCopyString = `psql "postgres://${encodeURIComponent(
    user.email
  )}@${environmentdAddress}/materialize"`;

  return (
    <TabbedCodeBlock
      data-test-id="connection-options"
      lineNumbers
      tabs={[
        { title: "Terminal", contents: psqlCopyString, icon: <TerminalIcon /> },
        {
          title: "External tools",
          contents: `HOST=${environmentdAddress.split(":")[0]}

PORT=${environmentdAddress.split(":")[1]}

USER=${user.email}

DATABASE=materialize`,
          icon: <MonitorIcon />,
        },
      ]}
      minHeight="208px"
    />
  );
};

export default ConnectSteps;
