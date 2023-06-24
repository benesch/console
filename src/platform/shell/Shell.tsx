import "./crt.css";

import {
  Code,
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
import debounce from "lodash.debounce";
import React, { useEffect, useRef } from "react";
import {
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";

import { Error, Notice } from "~/api/materialize/types";
import { useSqlWs } from "~/api/materialize/websocket";
import { MaterializeTheme } from "~/theme";
import { assert } from "~/util";

import CommandBlock from "./CommandBlock";
import CommandChevron from "./CommandChevron";
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
  historyItemCommandResultsSelector,
  historySelector,
  promptAtom,
  shellStateAtom,
} from "./recoil/shell";
import ShellPrompt from "./ShellPrompt";

const ERROR_OUTPUT_MAX_WIDTH = "1008px";

const NoticeOutput = ({ notice }: { notice: Notice }) => {
  const { colors } = useTheme<MaterializeTheme>();
  return (
    <VStack alignItems="flex-start">
      <Code color={colors.foreground.secondary}>
        {notice.severity.toUpperCase()}: {notice.message}
      </Code>
      {notice.detail && (
        <Code color={colors.foreground.secondary}>DETAIL: {notice.detail}</Code>
      )}
      {notice.hint && (
        <Code color={colors.foreground.secondary}>HINT: {notice.hint}</Code>
      )}
    </VStack>
  );
};

const ErrorOutput = ({ error, ...props }: { error: Error } & StackProps) => {
  const { colors } = useTheme<MaterializeTheme>();

  return (
    <VStack
      alignItems="flex-start"
      borderRadius="lg"
      borderWidth="1px"
      borderColor={colors.border.secondary}
      p="4"
      {...props}
    >
      <Code>Error: {error.message}</Code>
      {error.detail && <Code>Detail: {error.detail}</Code>}
      {error.hint && <Code>Hint: {error.hint}</Code>}
    </VStack>
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

type HistoryOutputProps = {
  historyId?: HistoryId;
};

const HistoryOutput = (props: HistoryOutputProps) => {
  const { colors } = useTheme<MaterializeTheme>();
  const historyOutput = useRecoilValue(historyItemAtom(props.historyId ?? ""));
  const commandResults = useRecoilValue(
    historyItemCommandResultsSelector(props.historyId ?? "")
  );

  return (
    <VStack
      alignItems="flex-start"
      borderBottomWidth="1px"
      width="100%"
      p="6"
      borderBottomColor={colors.border.secondary}
      spacing={0}
    >
      {historyOutput.kind === "notice" ? (
        <NoticeOutput notice={historyOutput} />
      ) : (
        <HStack alignItems="flex-start" width="100%">
          <CommandChevron />
          <VStack spacing="6" alignItems="flex-start" width="100%">
            <CommandBlock readOnly value={historyOutput.command} />

            {(commandResults ?? []).map((commandResult, commandResultIdx) => {
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
                    color={hasErrored ? colors.accent.red : colors.accent.green}
                  >
                    {timeTaken}
                  </Code>
                </React.Fragment>
              );
            })}
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

  const [shellState, setShellState] = useRecoilState(shellStateAtom);

  const getStateMachine = () => {
    if (stateMachineRef.current !== null) {
      return stateMachineRef.current as StateMachine.Service<
        WebSocketFsmContext,
        WebSocketFsmEvent,
        WebSocketFsmState
      >;
    }

    const stateMachine = interpret(WebSocketFsm);

    stateMachineRef.current = stateMachine;
    return stateMachine;
  };

  const { socket } = useSqlWs({
    open: true,
  });

  const { webSocketState } = shellState;

  const commitToHistory = useRecoilCallback(({ set }) => {
    return (historyItem: HistoryItem) => {
      set(historyItemAtom(historyItem.historyId), historyItem);
      set(historyIdsAtom, (curHistoryIds) => [
        ...curHistoryIds,
        historyItem.historyId,
      ]);
    };
  }, []);

  const clearHistory = useRecoilCallback(({ reset, set }) => {
    return () => {
      set(historyIdsAtom, (curHistoryIds) => {
        curHistoryIds.forEach((historyId) => reset(historyItemAtom(historyId)));
        return [];
      });
    };
  });

  const updateHistoryItem = useRecoilCallback(({ set }) => {
    return (historyItem: HistoryItem) => {
      const id = historyItem.historyId;
      set(historyItemAtom(id), historyItem);
    };
  }, []);

  const history = useRecoilValue(historySelector);
  const historyIds = useRecoilValue(historyIdsAtom);

  const setPrompt = useSetRecoilState(promptAtom);

  useEffect(() => {
    const scrollToBottom = () => {
      if (shellContainerRef.current) {
        shellContainerRef.current.scrollTop =
          shellContainerRef.current.scrollHeight;
      }
    };

    if (
      webSocketState === "readyForQuery" ||
      webSocketState === "commandInProgressStreaming"
    ) {
      scrollToBottom();
    }
  }, [webSocketState]);

  useEffect(() => {
    if (socket === null) {
      return;
    }

    const stateMachine = getStateMachine();

    stateMachine.subscribe(({ value }) => {
      setShellState((prevState) => ({ ...prevState, webSocketState: value }));
    });

    stateMachine.subscribe((state) => {
      if (!state.changed && !state.matches("initialState")) {
        // TODO: Handle this error properly and log the event that caused the unsuccessful transition
        console.error("Unsuccessful transition", state);
      }
    });

    stateMachine.start();

    const debouncedUpdateHistoryItem = debounce(updateHistoryItem, 100);

    socket.onResult((result) => {
      switch (result.type) {
        case "ReadyForQuery":
          if (stateMachine.state.matches("initialState")) {
            stateMachine.send("READY_FOR_QUERY");
          } else {
            stateMachine.send("READY_FOR_QUERY");
            assert(stateMachine.state.context.latestCommandOutput);
            updateHistoryItem(stateMachine.state.context.latestCommandOutput);
          }
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

          if (stateMachine.state.matches("commandInProgressStreaming")) {
            assert(stateMachine.state.context.latestCommandOutput);
            debouncedUpdateHistoryItem(
              stateMachine.state.context.latestCommandOutput
            );
          }
          break;
        case "Row":
          if (stateMachine.state.matches("commandInProgressStreaming")) {
            stateMachine.send({ type: "ROW", row: result.payload });

            assert(stateMachine.state.context.latestCommandOutput);
            debouncedUpdateHistoryItem(
              stateMachine.state.context.latestCommandOutput
            );
          } else if (stateMachine.state.matches("commandInProgressHasRows")) {
            stateMachine.send({ type: "ROW", row: result.payload });
          }
          break;
        case "CommandComplete":
          stateMachine.send({
            type: "COMMAND_COMPLETE",
            commandCompletePayload: result.payload,
          });

          assert(stateMachine.state.context.latestCommandOutput);
          updateHistoryItem(stateMachine.state.context.latestCommandOutput);
          break;
        case "Notice":
          if (stateMachine.state.matches("readyForQuery")) {
            commitToHistory(createDefaultNoticeOutput(result.payload));
          } else {
            stateMachine.send({ type: "NOTICE", notice: result.payload });
            assert(stateMachine.state.context.latestCommandOutput);
            updateHistoryItem(stateMachine.state.context.latestCommandOutput);
          }
          break;
        case "Error":
          stateMachine.send({
            type: "ERROR",
            error: result.payload,
          });
          assert(stateMachine.state.context.latestCommandOutput);
          updateHistoryItem(stateMachine.state.context.latestCommandOutput);
          break;
      }
    });

    return () => {
      stateMachine.stop();
    };
  }, [socket, commitToHistory, updateHistoryItem, setShellState]);

  const runCommand = (command: string) => {
    assert(socket);

    const stateMachine = getStateMachine();

    // TODO: Assert state machine is started
    if (!stateMachine.state.matches("readyForQuery")) {
      return;
    }

    stateMachine.send({ type: "SEND", command });
    socket.send({ query: command });

    const { latestCommandOutput } = stateMachine.state.context;
    assert(latestCommandOutput);
    commitToHistory(latestCommandOutput);
  };

  const slashCommands = new Map<string, () => void>([
    [
      "hacktheplanet",
      () =>
        setShellState((currentState) => ({
          ...currentState,
          crtEnabled: !currentState.crtEnabled,
        })),
    ],
    ["clear", clearHistory],
  ]);

  const handlePromptInput = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      const text = (e.target as HTMLTextAreaElement).value.trim();

      if (text && text.at(-1) === ";") {
        runCommand(text);
        e.preventDefault();
        setPrompt("");
        return false;
      }

      if (text.startsWith("\\")) {
        const handler = slashCommands.get(text.substring(1));
        if (handler) {
          handler();
          setPrompt("");
          e.preventDefault();
          return false;
        }
      }
    }
    return true;
  };
  console.log("history", history);
  console.log("state machine state", webSocketState);

  return (
    <VStack
      overflow="auto"
      width="100%"
      height="100%"
      alignItems="flex-start"
      spacing="0"
      scrollBehavior="smooth"
      ref={shellContainerRef}
      className={
        "shell-container " + (shellState.crtEnabled ? "crt-enabled" : "")
      }
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
      <ShellPrompt
        flexGrow="1"
        flexShrink="1"
        minHeight="32"
        width="100%"
        onCommandBlockKeyDown={handlePromptInput}
      />
    </VStack>
  );
};

export default Shell;
