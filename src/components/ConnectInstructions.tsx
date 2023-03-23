import { BoxProps, Spinner } from "@chakra-ui/react";
import { useAuth } from "@frontegg/react";
import React from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";

import { TabbedCodeBlock } from "~/components/copyableComponents";
import { ClusterDetailParams } from "~/platform/clusters/ClusterRoutes";
import { currentEnvironmentState } from "~/recoil/environments";
import MonitorIcon from "~/svg/Monitor";
import TerminalIcon from "~/svg/Terminal";

const ConnectInstructions = (props: BoxProps): JSX.Element => {
  const { user } = useAuth();
  const currentEnvironment = useRecoilValue(currentEnvironmentState);
  const { clusterName } = useParams<ClusterDetailParams>();

  if (!currentEnvironment || currentEnvironment.state !== "enabled" || !user) {
    return <Spinner />;
  }

  const environmentdAddress = currentEnvironment.environmentdPgwireAddress;

  const defaultClusterOptionString = clusterName
    ? `&options=--cluster%3D${clusterName}`
    : "";

  // NOTE(benesch): We'd like to use `sslmode=verify-full` to prevent MITM
  // attacks, but that mode requires specifying `sslrootcert=/path/to/cabundle`,
  // and that path varies by platform. So instead we use `require`, which is
  // at least better than the default of `prefer`.
  const psqlCopyString = `psql "postgres://${encodeURIComponent(
    user.email
  )}@${environmentdAddress}/materialize?sslmode=require${defaultClusterOptionString}"`;

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

export default ConnectInstructions;
