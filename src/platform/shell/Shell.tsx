import {
  Box,
  Code,
  Flex,
  HStack,
  StackProps,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import { interpret, StateMachine } from "@xstate/fsm";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilCallback, useRecoilValue } from "recoil";

import { Error, Notice } from "~/api/materialize/types";
import { useSqlWs } from "~/api/materialize/websocket";
import { MaterializeTheme } from "~/theme";
import { assert } from "~/util";

import CommandBlock from "./CommandBlock";
import WebSocketFsm, {
  WebSocketFsmContext,
  WebSocketFsmEvent,
  WebSocketFsmState,
} from "./machines/webSocketFsm";
import {
  createDefaultNoticeOutput,
  HistoryId,
  historyIdsAtom,
  HistoryItem,
  historyItemAtom,
  historySelector,
} from "./recoil/shell";

const ERROR_OUTPUT_MAX_WIDTH = "1008px";

const NoticeOutput = ({ notice }: { notice: Notice }) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <VStack alignItems="flex-start">
      <Code color={semanticColors.foreground.secondary}>
        {notice.severity.toUpperCase()}: {notice.message}
      </Code>
      {notice.detail && (
        <Code color={semanticColors.foreground.secondary}>
          DETAIL: {notice.detail}
        </Code>
      )}
      {notice.hint && (
        <Code color={semanticColors.foreground.secondary}>
          HINT: {notice.hint}
        </Code>
      )}
    </VStack>
  );
};

const ErrorOutput = ({ error, ...props }: { error: Error } & StackProps) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <Flex
      alignItems="flex-start"
      borderRadius="lg"
      borderWidth="1px"
      borderColor={semanticColors.border.secondary}
      p="4"
      {...props}
    >
      <Code>Error: {error.message}</Code>
    </Flex>
  );
};

const SqlSelectTable = ({
  cols,
  rows,
}: {
  cols: string[];
  rows: unknown[][];
}) => {
  const getTableHeaderStyles = (tableHeaderIdx: number) => {
    if (rows.length > 0) {
      return {};
    }

    if (tableHeaderIdx === 0) {
      return {
        borderBottomLeftRadius: "md",
      };
    }

    if (tableHeaderIdx === cols.length - 1) {
      return {
        borderBottomRightRadius: "md",
      };
    }

    return {};
  };

  return (
    <Table variant="shell">
      <Thead>
        <Tr>
          <Td colSpan={cols.length}>Results</Td>
        </Tr>
        <Tr>
          {cols.map((column, idx) => (
            <Th key={idx} {...getTableHeaderStyles(idx)}>
              {column}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row, rowIdx) => (
          <Tr key={rowIdx}>
            {row.map((cell, cellIdx) => {
              const cellVal =
                typeof cell !== "string" ? JSON.stringify(cell) : cell;

              return <Td key={cellIdx}>{cellVal}</Td>;
            })}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

const CommandChevron = () => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();

  return (
    <Box fontSize="lg" lineHeight="6" color={semanticColors.accent.purple}>
      &gt;
    </Box>
  );
};

type HistoryOutputProps = {
  historyId?: HistoryId;
};

const HistoryOutput = (props: HistoryOutputProps) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  const historyOutput = useRecoilValue(historyItemAtom(props.historyId ?? ""));

  return (
    <VStack
      alignItems="flex-start"
      borderBottomWidth="1px"
      width="100%"
      p="6"
      borderBottomColor={semanticColors.border.secondary}
      spacing={0}
    >
      {historyOutput.kind === "notice" ? (
        <NoticeOutput notice={historyOutput} />
      ) : (
        <HStack alignItems="flex-start" width="100%">
          <CommandChevron />
          <VStack spacing="6" alignItems="flex-start" width="100%">
            <CommandBlock readOnly value={historyOutput.command} />

            {historyOutput.commandResults.map(
              (commandResult, commandResultIdx) => {
                const {
                  hasRows,
                  endTimeMs,
                  initialTimeMs,
                  commandCompletePayload,
                  notices,
                  cols,
                  rows,
                  error,
                } = commandResult;

                let renderTable = null;
                if (hasRows && cols) {
                  renderTable = (
                    <TableContainer>
                      <SqlSelectTable rows={rows ?? []} cols={cols} />
                    </TableContainer>
                  );
                }

                const timeTaken =
                  endTimeMs && initialTimeMs
                    ? `Returned in ${(endTimeMs - initialTimeMs).toFixed(1)}ms`
                    : null;

                const hasErrored = !!error;

                return (
                  <React.Fragment key={commandResultIdx}>
                    {!hasRows && !error && (
                      <CommandBlock readOnly value={commandCompletePayload} />
                    )}
                    {renderTable}

                    {notices.map((notice, noticeIdx) => (
                      <NoticeOutput key={noticeIdx} notice={notice} />
                    ))}
                    {error && (
                      <ErrorOutput
                        error={error}
                        width="100%"
                        maxWidth={ERROR_OUTPUT_MAX_WIDTH}
                      />
                    )}
                    <Code
                      color={
                        hasErrored
                          ? semanticColors.accent.red
                          : semanticColors.accent.green
                      }
                    >
                      {timeTaken}
                    </Code>
                  </React.Fragment>
                );
              }
            )}
            {historyOutput.error && (
              <ErrorOutput
                error={historyOutput.error}
                width="100%"
                maxWidth={ERROR_OUTPUT_MAX_WIDTH}
              />
            )}
          </VStack>
        </HStack>
      )}
    </VStack>
  );
};

const Shell = () => {
  const shellContainerRef = useRef<HTMLDivElement | null>(null);

  const stateMachineRef = useRef<StateMachine.Service<
    WebSocketFsmContext,
    WebSocketFsmEvent,
    WebSocketFsmState
  > | null>(null);

  const getStateMachine = () => {
    if (stateMachineRef.current !== null) {
      return stateMachineRef.current as StateMachine.Service<
        WebSocketFsmContext,
        WebSocketFsmEvent,
        WebSocketFsmState
      >;
    }

    const stateMachine = interpret(WebSocketFsm);
    stateMachine.start();
    stateMachineRef.current = stateMachine;
    return stateMachine;
  };

  const { socket, socketReady } = useSqlWs({ open: true });

  const commitToHistory = useRecoilCallback(({ set }) => {
    return (historyItem: HistoryItem) => {
      set(historyItemAtom(historyItem.historyId), historyItem);
      set(historyIdsAtom, (curHistoryIds) => [
        ...curHistoryIds,
        historyItem.historyId,
      ]);
    };
  });

  const updateHistoryItem = useRecoilCallback(({ set }) => {
    return (historyItem: HistoryItem) => {
      const id = historyItem.historyId;
      set(historyItemAtom(id), historyItem);
    };
  });

  const history = useRecoilValue(historySelector);
  const historyIds = useRecoilValue(historyIdsAtom);

  const [currentCommand, setCurrentCommand] = useState("");

  useEffect(() => {
    const scrollToTopOnCommandComplete = () => {
      // Won't work for subscribe, maybe use state machine values?
      if (shellContainerRef.current) {
        shellContainerRef.current.scrollTop =
          shellContainerRef.current.scrollHeight;
      }
    };
    scrollToTopOnCommandComplete();
  }, [historyIds, socketReady]);

  useEffect(() => {
    if (!socketReady) {
      return;
    }

    assert(socket);

    socket.onResult((result) => {
      const stateMachine = getStateMachine();
      const { state } = stateMachine;

      switch (result.type) {
        case "ReadyForQuery":
          stateMachine.send("READY_FOR_QUERY");

          assert(state.context.latestCommandOutput);
          updateHistoryItem(state.context.latestCommandOutput);
          break;
        case "CommandStarting":
          if (result.payload.is_streaming) {
            stateMachine.send({
              type: "COMMAND_STARTING_IS_STREAMING",
              hasRows: result.payload.has_rows,
            });
          } else if (result.payload.has_rows) {
            stateMachine.send("COMMAND_STARTING_HAS_ROWS");
          } else {
            stateMachine.send("COMMAND_STARTING_DEFAULT");
          }
          break;
        case "Rows":
          stateMachine.send({ type: "ROWS", rows: result.payload });
          break;
        case "Row":
          if (state.matches("commandInProgressStreaming")) {
            stateMachine.send({ type: "ROW", row: result.payload });

            assert(state.context.latestCommandOutput);
            updateHistoryItem(state.context.latestCommandOutput);
          } else if (state.matches("commandInProgressHasRows")) {
            stateMachine.send({ type: "ROW", row: result.payload });
          }
          break;
        case "CommandComplete":
          stateMachine.send({
            type: "COMMAND_COMPLETE",
            commandCompletePayload: result.payload,
          });

          assert(state.context.latestCommandOutput);
          updateHistoryItem(state.context.latestCommandOutput);
          break;
        case "Notice":
          if (state.matches("readyForQuery")) {
            commitToHistory(createDefaultNoticeOutput(result.payload));
          } else {
            stateMachine.send({ type: "NOTICE", notice: result.payload });
            assert(state.context.latestCommandOutput);
            updateHistoryItem(state.context.latestCommandOutput);
          }
          break;
        case "Error":
          stateMachine.send({
            type: "ERROR",
            error: result.payload,
          });
          assert(state.context.latestCommandOutput);
          updateHistoryItem(state.context.latestCommandOutput);
          break;
      }
    });
  }, [socket, socketReady, commitToHistory, updateHistoryItem]);

  const runCommand = (command: string) => {
    if (!socketReady) {
      return;
    }

    assert(socket);

    const stateMachine = getStateMachine();

    if (!stateMachine.state.matches("readyForQuery")) {
      return;
    }

    stateMachine.send({ type: "SEND", command });
    socket.send({ query: command });

    const { latestCommandOutput } = stateMachine.state.context;
    assert(latestCommandOutput);
    commitToHistory(latestCommandOutput);
  };

  const handlePromptInput = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      const text = (e.target as HTMLTextAreaElement).value.trim();

      if (text && text.at(-1) === ";") {
        runCommand(text);
        e.preventDefault();
        setCurrentCommand("");
        return false;
      }
    }
    return true;
  };
  console.log(history);

  return (
    <VStack
      overflow="auto"
      width="100%"
      height="100%"
      alignItems="flex-start"
      spacing="0"
      ref={shellContainerRef}
    >
      {historyIds.length > 0 && (
        <VStack
          flexGrow="0"
          flexShrink="0"
          alignItems="flex-start"
          width="100%"
          minHeight="0"
          spacing="0"
        >
          {historyIds.map((historyId) => (
            <HistoryOutput key={historyId} historyId={historyId} />
          ))}
        </VStack>
      )}
      <HStack
        flexGrow="1"
        flexShrink="1"
        minHeight="72px"
        alignItems="flex-start"
        width="100%"
        p="6"
        overflow="auto"
      >
        <CommandChevron />
        <CommandBlock
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={handlePromptInput}
          autoFocus={true}
          value={currentCommand}
          placeholder="-- write your query here"
          containerProps={{
            width: "100%",
            height: "100%",
          }}
          textAreaStyleProps={{
            width: "100%",
            height: "100%",
          }}
        />
      </HStack>
    </VStack>
  );
};

export default Shell;
