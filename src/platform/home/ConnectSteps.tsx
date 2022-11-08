import { Spinner, TabPanel, TabPanels } from "@chakra-ui/react";
import { useAuth } from "@frontegg/react";
import React from "react";
import { useRecoilValue } from "recoil";

import {
  Card,
  CardContent,
  CardTab,
  CardTabs,
  CardTabsHeaders,
} from "../../components/cardComponents";
import { CodeBlock, CopyableBox } from "../../components/copyableComponents";
import { currentEnvironmentState } from "../../recoil/environments";

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
    <Card>
      <CardTabs>
        <CardTabsHeaders data-test-id="connection-options">
          <CardTab>Terminal</CardTab>
          <CardTab>External tools</CardTab>
        </CardTabsHeaders>
        <CardContent>
          <TabPanels
            minHeight="190.8px" // manually set to tallest panel's height
          >
            <TabPanel>
              <CopyableBox contents={psqlCopyString}>
                {psqlCopyString}
              </CopyableBox>
            </TabPanel>
            <TabPanel>
              <CodeBlock
                title="Connection information"
                contents={`HOST=${environmentdAddress.split(":")[0]}

PORT=${environmentdAddress.split(":")[1]}

USER=${user.email}

DATABASE=materialize`}
                lineNumbers
              />
            </TabPanel>
          </TabPanels>
        </CardContent>
      </CardTabs>
    </Card>
  );
};

export default ConnectSteps;
