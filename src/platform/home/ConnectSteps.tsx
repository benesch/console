import { BoxProps, Spinner } from "@chakra-ui/react";
import { useAuth } from "@frontegg/react";
import React from "react";
import { useRecoilValue } from "recoil";

import { TabbedCodeBlock } from "~/components/copyableComponents";
import { currentEnvironmentState } from "~/recoil/environments";
import MonitorIcon from "~/svg/Monitor";
import TerminalIcon from "~/svg/Terminal";

const ConnectSteps = (props: BoxProps): JSX.Element => {
  const { user } = useAuth();
  const currentEnvironment = useRecoilValue(currentEnvironmentState);

  if (!currentEnvironment || currentEnvironment.state !== "enabled" || !user) {
    return <Spinner />;
  }

  const environmentdAddress = currentEnvironment.environmentdPgwireAddress;

  // NOTE(benesch): We'd like to use `sslmode=verify-full` to prevent MITM
  // attacks, but that mode requires specifying `sslrootcert=/path/to/cabundle`,
  // and that path varies by platform. So instead we use `require`, which is
  // at least better than the default of `prefer`.
  const psqlCopyString = `psql "postgres://${encodeURIComponent(
    user.email
  )}@${environmentdAddress}/materialize?sslmode=require"`;

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
      {...props}
    />
  );
};

export default ConnectSteps;
