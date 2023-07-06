import {
  Box,
  Button,
  Code,
  GridItem,
  GridItemProps,
  HStack,
  IconButton,
  StackProps,
  Text,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import React, { PropsWithChildren } from "react";
import { useRecoilState } from "recoil";

import { TabbedCodeBlock } from "~/components/copyableComponents";
import CommandIcon from "~/svg/CommandIcon";
import { MaterializeTheme } from "~/theme";

import { shellStateAtom } from "./recoil/shell";

type RunnableProps = {
  runCommand: (value: string) => void;
  title: string;
  value: string;
};

const Runnable = ({ runCommand, value, title }: RunnableProps) => {
  const { colors } = useTheme<MaterializeTheme>();

  return (
    <TabbedCodeBlock
      width="100%"
      flexShrink="0"
      tabs={[{ title, contents: value }]}
      lineNumbers
      syntaxHighlighting
      headingIcon={
        <IconButton
          aria-label="Run command button"
          title="Run command"
          onClick={() => runCommand(value)}
          icon={<CommandIcon color={colors.foreground.secondary} />}
          variant="unstyled"
          rounded={0}
          sx={{
            _hover: {
              background: "rgba(255, 255, 255, 0.06)",
            },
          }}
        />
      }
    />
  );
};

const TextContainer = ({ children }: PropsWithChildren) => (
  <VStack spacing="4" alignItems="flex-start">
    {children}
  </VStack>
);

const RunnableContainer = ({ children }: PropsWithChildren) => (
  <VStack spacing="6">{children}</VStack>
);

const StepsContainer = ({ children }: PropsWithChildren) => (
  <VStack spacing="6" alignItems="stretch">
    {children}
  </VStack>
);

const Steps: Array<(runCommand: (value: string) => void) => JSX.Element> = [
  (runCommand) => (
    <StepsContainer>
      <TextContainer>
        <Text textStyle="heading-md">Create clusters</Text>
        <Text textStyle="text-base">
          Use the <Code variant="inline-syntax">CREATE CLUSTER</Code> command to
          create two new clusters:
        </Text>
      </TextContainer>
      <RunnableContainer>
        <Runnable
          runCommand={runCommand}
          value="CREATE CLUSTER ingest_qck SIZE = '2xsmall';"
          title="Create ingest cluster"
        />
        <Runnable
          runCommand={runCommand}
          value="CREATE CLUSTER compute_qck SIZE = '2xsmall';"
          title="Create compute cluster"
        />
      </RunnableContainer>
      <Text textStyle="text-base">
        The <Code variant="inline-syntax">2xsmall</Code> replica size is
        sufficient for the data ingestion and computation in this getting
        started scenario.
      </Text>
    </StepsContainer>
  ),
  (runCommand) => (
    <StepsContainer>
      <TextContainer>
        <Text textStyle="heading-md">Create clusters</Text>
        <Text textStyle="text-base">
          The physical compute resources in your clusters are called{" "}
          <Code variant="inline-syntax">replicas</Code>. Use the{" "}
          <Code variant="inline-syntax">SHOW CLUSTER REPLICAS</Code> command to
          check the status of the replicas:
        </Text>
      </TextContainer>
      <Runnable
        runCommand={runCommand}
        value="SHOW CLUSTER REPLICAS WHERE cluster IN ('compute_qck', 'ingest_qck');"
        title="Show cluster replicas"
      />
      <Text textStyle="text-base">
        Once both replicas are ready (
        <Code variant="inline-syntax">ready=true</Code>), move on to the next
        step.
      </Text>
    </StepsContainer>
  ),
  (runCommand) => (
    <StepsContainer>
      <TextContainer>
        <Text textStyle="heading-md">Ingest streaming data</Text>
        <Text textStyle="text-base">
          Most objects in Materialize are namespaced by database and schema,
          including sources, so start by creating a unique schema within the
          default <Code variant="inline-syntax">materialize</Code> database:
        </Text>
      </TextContainer>

      <RunnableContainer>
        <Runnable
          runCommand={runCommand}
          value="CREATE SCHEMA qck;"
          title="Create schema"
        />
        <Runnable
          runCommand={runCommand}
          value="SET schema = qck;"
          title="Set schema"
        />
      </RunnableContainer>
    </StepsContainer>
  ),
  (runCommand) => (
    <StepsContainer>
      <TextContainer>
        <Text textStyle="heading-md">Ingest streaming data</Text>
        <Text textStyle="text-base">
          Use the <Code variant="inline-syntax">CREATE SOURCE</Code> command to
          create the auction house source:
        </Text>
      </TextContainer>

      <Runnable
        runCommand={runCommand}
        value={`CREATE SOURCE auction_house
  IN CLUSTER ingest_qck
  FROM LOAD GENERATOR AUCTION
  FOR ALL TABLES;`}
        title="Create auction house source"
      />
      <Text textStyle="text-base">
        Note that the <Code variant="inline-syntax">IN CLUSTER</Code> clause
        attaches this source to the existing{" "}
        <Code variant="inline-syntax">ingest_qck</Code> cluster, but it&apos;s
        also possible to create a cluster and replica at the time of source
        creation using the <Code variant="inline-syntax">WITH SIZE</Code>{" "}
        option.
      </Text>
    </StepsContainer>
  ),
  (runCommand) => (
    <StepsContainer>
      <TextContainer>
        <Text textStyle="heading-md">Ingest streaming data</Text>
        <Text textStyle="text-base">
          Now that you&apos;ve created a source, Materialize starts ingesting
          data into durable storage, automatically splitting the stream into
          multiple <em>subsources</em> that represent different tables. Use the{" "}
          <Code variant="inline-syntax">SHOW SOURCES</Code> command to get an
          idea of the data being generated:
        </Text>
      </TextContainer>

      <Runnable
        runCommand={runCommand}
        value="SHOW SOURCES;"
        title="Show sources"
      />
      <Text textStyle="text-base">
        In addition to the <Code variant="inline-syntax">auction_house</Code>{" "}
        load generator source and its subsources, you&apos;ll see{" "}
        <Code variant="inline-syntax">auction_house_progress</Code>, which
        Materialize creates so you can monitor source ingestion.
      </Text>
    </StepsContainer>
  ),
  (runCommand) => (
    <StepsContainer>
      <TextContainer>
        <Text textStyle="heading-md">Ingest streaming data</Text>
        <Text textStyle="text-base">
          Before moving on, get a sense of the data you&apos;ll be working with:
        </Text>
      </TextContainer>

      <RunnableContainer>
        <Runnable
          runCommand={runCommand}
          title="Show first auction"
          value="SELECT * FROM auctions LIMIT 1;"
        />
        <Runnable
          runCommand={runCommand}
          title="Show first bid"
          value="SELECT * FROM bids LIMIT 1;"
        />
      </RunnableContainer>
    </StepsContainer>
  ),
  (runCommand) => (
    <StepsContainer>
      <TextContainer>
        <Text textStyle="heading-md">Compute real-time results</Text>
        <Text textStyle="text-base">
          With auction data streaming in, you can now explore the unique value
          of Materialize: computing real-time results over fast-changing data.
        </Text>
      </TextContainer>

      <Runnable
        runCommand={runCommand}
        value="SET CLUSTER = compute_qck;"
        title="Switch to compute cluster"
      />
      <Text textStyle="text-base">
        First, create a <Code variant="inline-syntax">VIEW</Code>:
      </Text>
      <Runnable
        runCommand={runCommand}
        value={`CREATE VIEW avg_bids AS
  SELECT auctions.item, avg(bids.amount) AS average_bid
  FROM bids
  JOIN auctions ON bids.auction_id = auctions.id
  WHERE bids.bid_time < auctions.end_time
  GROUP BY auctions.item;`}
        title="Create avg_bids view"
      />
      <TextContainer>
        <Text textStyle="text-base">
          This view joins data from{" "}
          <Code variant="inline-syntax">auctions</Code> and{" "}
          <Code variant="inline-syntax">bids</Code> to get the average price of
          bids that arrived before their auctions closed.
        </Text>
        <Text textStyle="text-base">
          Note that, as in other SQL databases, a view in Materialize is simply
          an alias for the embedded <Code variant="inline-syntax">SELECT</Code>{" "}
          statement. Materialize computes the results of the query only when the
          view is called.
        </Text>
      </TextContainer>
    </StepsContainer>
  ),
  (runCommand) => (
    <StepsContainer>
      <TextContainer>
        <Text textStyle="heading-md">Compute real-time results</Text>
        <Text textStyle="text-base">Query the view a few times:</Text>
      </TextContainer>

      <Runnable
        runCommand={runCommand}
        value="SELECT * FROM avg_bids;"
        title="Query avg_bids"
      />

      <Text textStyle="text-base">
        You&apos;ll see the average bid change as new auction data streams into
        Materialize. However, the view retrieves data from durable storage and
        computes results at query-time, so latency is high and would be much
        higher with a production dataset.
      </Text>
    </StepsContainer>
  ),
  (runCommand) => (
    <StepsContainer>
      <TextContainer>
        <Text textStyle="heading-md">Compute real-time results</Text>
        <Text textStyle="text-base">
          Next, create an <b>index</b> on the view:
        </Text>
      </TextContainer>

      <Runnable
        runCommand={runCommand}
        value="CREATE INDEX avg_bids_idx ON avg_bids (item);"
        title="Create index on avg_bids"
      />
      <TextContainer>
        <Text textStyle="text-base">
          🚀🚀🚀 This is where Materialize becomes a true streaming database.
          When you use an index,{" "}
          <b>
            Materialize incrementally computes the results of the indexed query
            in memory as new data arrives
          </b>
          .
        </Text>
        <Text textStyle="text-base">Query the view again:</Text>
      </TextContainer>
      <Runnable
        runCommand={runCommand}
        value="SELECT * FROM avg_bids;"
        title="Query avg_bids"
      />
      <Text textStyle="text-base">
        You&apos;ll see the average bids continue to change, but now that the
        view is indexed and results are pre-computed and stored in memory,
        latency is down considerably!
      </Text>
    </StepsContainer>
  ),
  (runCommand) => (
    <StepsContainer>
      <TextContainer>
        <Text textStyle="heading-md">Compute real-time results</Text>
        <Text textStyle="text-base">
          One thing to note about indexes is that they exist only in the cluster
          where they are created. To experience this, switch to the{" "}
          <Code variant="inline-syntax">default</Code> cluster and query the
          view again:
        </Text>
      </TextContainer>

      <RunnableContainer>
        <Runnable
          runCommand={runCommand}
          value="SET CLUSTER = default;"
          title="Set cluster to default"
        />
        <Runnable
          runCommand={runCommand}
          value="SELECT * FROM avg_bids;"
          title="Query avg_bids"
        />
      </RunnableContainer>
      <Text textStyle="text-base">
        Latency is high again because the index you created on the view exists
        only inside the <Code variant="inline-syntax">compute_qck</Code>{" "}
        cluster. In the <Code variant="inline-syntax">default</Code> cluster,
        where you are currently, you don&apos;t have access to the index&apos;s
        pre-computed results. Instead, the view once again retrieves data from
        durable storage and computes the results at query-time.
      </Text>
    </StepsContainer>
  ),
  (runCommand) => (
    <StepsContainer>
      <TextContainer>
        <Text textStyle="heading-md">Compute real-time results</Text>
        <Text textStyle="text-base">
          In many cases, you&apos;ll want results to be accessible from multiple
          clusters, however. To achieve this, you use materialized views.
        </Text>
        <Text textStyle="text-base">
          Like an index, a materialized view incrementally computes the results
          of a query as new data arrives. But unlike an index,{" "}
          <b>a materialized view persists its results to durable storage</b>{" "}
          that is accessible to all clusters.
        </Text>
        <Text textStyle="text-base">
          To see this in action, confirm that you are in the{" "}
          <Code variant="inline-syntax">default</Code> cluster and then create a
          materialized view:
        </Text>
      </TextContainer>

      <RunnableContainer>
        <Runnable
          runCommand={runCommand}
          value="SHOW CLUSTER;"
          title="Show cluster"
        />
        <Runnable
          runCommand={runCommand}
          value={`CREATE MATERIALIZED VIEW num_bids AS
  SELECT auctions.item, count(bids.id) AS number_of_bids
  FROM bids
  JOIN auctions ON bids.auction_id = auctions.id
  WHERE bids.bid_time < auctions.end_time
  GROUP BY auctions.item;`}
          title="Create materialized view num_bids"
        />
      </RunnableContainer>
      <Text textStyle="text-base">
        The <Code variant="inline-syntax">SELECT</Code> in this materialized
        view joins data from <Code variant="inline-syntax">auctions</Code> and{" "}
        <Code variant="inline-syntax">bids</Code>, but this time to get the
        number of eligible bids per item.
      </Text>
    </StepsContainer>
  ),
  (runCommand) => (
    <StepsContainer>
      <TextContainer>
        <Text textStyle="heading-md">Compute real-time results</Text>
        <Text textStyle="text-base">
          Switch to the <Code variant="inline-syntax">compute_qck</Code> cluster
          and query the materialized view:
        </Text>
      </TextContainer>

      <RunnableContainer>
        <Runnable
          runCommand={runCommand}
          value="SET CLUSTER = compute_qck;"
          title="Set cluster to compute cluster"
        />
        <Runnable
          runCommand={runCommand}
          value="SELECT * FROM num_bids;"
          title="Query num_bids"
        />
      </RunnableContainer>
      <TextContainer>
        <Text textStyle="text-base">
          As you can see, although the materialized view was created in the{" "}
          <Code variant="inline-syntax">default</Code> cluster, its results are
          available from other clusters as well because they are in shared,
          durable storage.
        </Text>
        <Text textStyle="text-base">
          If retrieving a materialized view&apos;s results from storage is too
          slow, you can create an index on the materialized view as well:
        </Text>
      </TextContainer>
      <RunnableContainer>
        <Runnable
          runCommand={runCommand}
          value="CREATE INDEX num_bids_idx ON num_bids (item);"
          title="Create index on num_bids"
        />
        <Runnable
          runCommand={runCommand}
          value="SELECT * FROM num_bids;"
          title="Query num_bids"
        />
      </RunnableContainer>
      <Text textStyle="text-base">
        Now that the materialized view serves results from memory, latency is
        low again.
      </Text>
    </StepsContainer>
  ),
  (runCommand) => (
    <StepsContainer>
      <TextContainer>
        <Text textStyle="heading-md">Compute real-time results</Text>
        <Text textStyle="text-base">
          As new bids come in, a change will occur in the materialized view.
          That&apos;ll leave your query results less reflective of what the
          actual data says.
        </Text>
        <Text textStyle="text-base">
          🧑‍🔬 Materialize has a solution for that! You can use a{" "}
          <Code variant="inline-syntax">SUBSCRIBE</Code> command to be streamed
          updates to the view
        </Text>
      </TextContainer>

      <Runnable
        runCommand={runCommand}
        value="SUBSCRIBE num_bids;"
        title="Subscribe to num_bids"
      />
      <Text textStyle="text-base">Watch the results update in realtime!</Text>
    </StepsContainer>
  ),
  (runCommand) => (
    <StepsContainer>
      <TextContainer>
        <Text textStyle="heading-md">Clean up</Text>
        <Text textStyle="text-base">
          Once you&apos;re done exploring the auction house source, remember to
          clean up your environment:
        </Text>
      </TextContainer>

      <RunnableContainer>
        <Runnable
          runCommand={runCommand}
          value="DROP SCHEMA qck CASCADE;"
          title="Drop schema"
        />
        <Runnable
          runCommand={runCommand}
          value="DROP CLUSTER ingest_qck;"
          title="Drop ingest cluster"
        />
        <Runnable
          runCommand={runCommand}
          value="DROP CLUSTER compute_qck;"
          title="Drop compute cluster"
        />
        <Runnable
          runCommand={runCommand}
          value="RESET schema;"
          title="Reset schema"
        />
        <Runnable
          runCommand={runCommand}
          value="RESET cluster;"
          title="Reset cluster"
        />
      </RunnableContainer>
    </StepsContainer>
  ),
];

type ProgressProps = {
  min: number;
  max: number;
  value: number;
} & StackProps;

const PROGRESS_STEP_SPACING = 1;

const Progress = ({ min, max, value, ...rest }: ProgressProps) => {
  const { colors } = useTheme<MaterializeTheme>();
  const steps: boolean[] = [];

  for (let i = min; i < max; i++) {
    steps.push(i <= value);
  }

  return (
    <HStack {...rest} spacing={PROGRESS_STEP_SPACING}>
      {steps.map((filled, idx) => {
        return (
          <Box
            key={idx}
            flexGrow="1"
            height="1"
            borderRadius="2px"
            bgColor={filled ? colors.accent.purple : colors.background.tertiary}
          />
        );
      })}
    </HStack>
  );
};

type TutorialProps = GridItemProps & {
  runCommand: (command: string) => void;
};

const Tutorial = ({ runCommand, ...rest }: TutorialProps) => {
  const { colors } = useTheme<MaterializeTheme>();
  const [shellState, setShellState] = useRecoilState(shellStateAtom);
  const { currentTutorialStep: step } = shellState;
  const changeStep = (desired: number) => {
    if (desired < 0) {
      desired = 0;
    } else if (desired >= Steps.length) {
      desired = Steps.length - 1;
    }
    setShellState((prev) => ({ ...prev, currentTutorialStep: desired }));
  };

  const atStart = step === 0;

  const atEnd = step >= Steps.length - 1;

  return (
    <GridItem
      area="tutorial"
      borderLeftWidth="1px"
      borderColor={colors.border.secondary}
      bg={colors.background.shellTutorial}
      borderBottomRightRadius="lg"
      overflow="auto"
      paddingY="6"
      paddingX="10"
      {...rest}
    >
      <VStack alignItems="flex-start" spacing="0">
        <Progress min={0} max={Steps.length} value={step} width="100%" />
        <Text
          textStyle="text-small"
          fontWeight="500"
          color={colors.foreground.secondary}
          marginTop="6"
          marginBottom="4"
        >
          TUTORIAL
        </Text>
        {Steps[step](runCommand)}
        <HStack
          width="100%"
          flexGrow="0"
          alignSelf="flex-end"
          alignItems="space-between"
          justifyContent={
            atStart ? "flex-end" : atEnd ? "flex-start" : "space-between"
          }
          mt="10"
        >
          {!atStart && (
            <Button onClick={() => changeStep(step - 1)} variant="tertiary">
              Back
            </Button>
          )}
          {!atEnd && (
            <Button
              onClick={() => {
                changeStep(step + 1);
              }}
              variant="primary"
            >
              Continue
            </Button>
          )}
        </HStack>
      </VStack>
    </GridItem>
  );
};

export default Tutorial;
