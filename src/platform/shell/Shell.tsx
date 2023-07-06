import "./crt.css";

import { CloseIcon } from "@chakra-ui/icons";
import {
  Button,
  Code,
  Grid,
  GridItem,
  HStack,
  IconButton,
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
import { captureException } from "@sentry/react";
import { interpret, InterpreterStatus, StateMachine } from "@xstate/fsm";
import debounce from "lodash.debounce";
import React, { useEffect, useRef, useState } from "react";
import { useIdleTimer } from "react-idle-timer";
import {
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";

import { Error as MaterializeError, Notice } from "~/api/materialize/types";
import { useSqlWs } from "~/api/materialize/websocket";
import CommandBlock from "~/components/CommandBlock";
import BookOpenIcon from "~/svg/BookOpenIcon";
import { MaterializeTheme } from "~/theme";
import { assert } from "~/util";

import CommandChevron from "./CommandChevron";
import WebSocketFsm, {
  WebSocketFsmContext,
  WebSocketFsmEvent,
  WebSocketFsmState,
} from "./machines/webSocketFsm";
import {
  calculateCommandDuration,
  createDefaultLocalCommandOutput,
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
import RunCommandButton from "./RunCommandButton";
import ShellPrompt from "./ShellPrompt";
import Tutorial from "./Tutorial";

const IDLE_TIMEOUT_MS = 10 * 60 * 1_000; // 10 minutes

const RECOIL_DEBOUNCE_WAIT_MS = 100;

const ERROR_OUTPUT_MAX_WIDTH = "1008px";

const NAVBAR_HEIGHT = "80px";

const TUTORIAL_WIDTH = "552px";

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

const LocalCommandOutput = ({
  command,
  commandResults,
}: {
  command: string;
  commandResults: string[][];
}) => {
  return (
    <VStack spacing="6" alignItems="flex-start" minWidth="0">
      <HStack alignItems="flex-start" width="100%">
        <CommandChevron />
        <CommandBlock value={command} readOnly />
      </HStack>
      <SqlSelectTable cols={["Command", "Description"]} rows={commandResults} />
    </VStack>
  );
};

const ErrorOutput = ({
  error,
  ...props
}: { error: MaterializeError } & StackProps) => {
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
      ) : historyOutput.kind === "localCommand" ? (
        <LocalCommandOutput
          command={historyOutput.command}
          commandResults={historyOutput.commandResults}
        />
      ) : (
        <HStack alignItems="flex-start" width="100%">
          <CommandChevron />
          <VStack spacing="6" alignItems="flex-start" flex="1" minWidth="0">
            <CommandBlock readOnly value={historyOutput.command} />

            {(commandResults ?? []).map((commandResult, commandResultIdx) => {
              const {
                hasRows,
                commandCompletePayload,
                notices,
                cols,
                rows,
                error,
              } = commandResult;

              let table = null;
              if (hasRows && cols) {
                table = (
                  <TableContainer>
                    <SqlSelectTable rows={rows ?? []} cols={cols} />
                  </TableContainer>
                );
              }

              const timeTaken = calculateCommandDuration(
                commandResult,
                historyOutput
              );

              const timeTakenStr = timeTaken
                ? `Returned in ${timeTaken.toFixed(1)}ms`
                : null;

              const hasErrored = !!error;

              return (
                <React.Fragment key={commandResultIdx}>
                  {!hasRows && !error && (
                    <CommandBlock readOnly value={commandCompletePayload} />
                  )}
                  {table}

                  {notices.map((notice, noticeIdx) => (
                    <NoticeOutput key={noticeIdx} notice={notice} />
                  ))}
                  {error && (
                    <ErrorOutput
                      error={error}
                      width="100%"
                      maxWidth={ERROR_OUTPUT_MAX_WIDTH}
                      overflow="auto"
                    />
                  )}
                  <Code
                    color={hasErrored ? colors.accent.red : colors.accent.green}
                  >
                    {timeTakenStr}
                  </Code>
                </React.Fragment>
              );
            })}
            {historyOutput.error && (
              <ErrorOutput
                error={historyOutput.error}
                width="100%"
                maxWidth={ERROR_OUTPUT_MAX_WIDTH}
                overflow="auto"
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

  const { colors } = useTheme<MaterializeTheme>();

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

  const [socketOpen, setSocketOpen] = useState(true);

  const { socket, socketError } = useSqlWs({
    open: socketOpen,
  });

  const isSocketAvailable = socket !== null && !socketError;

  useIdleTimer({
    timeout: IDLE_TIMEOUT_MS,
    onIdle: () => {
      setSocketOpen(false);
    },
    onActive: (e) => {
      const isTabHidden =
        e?.type === "visibilitychange" && document.visibilityState === "hidden";
      if (isTabHidden) {
        return;
      }
      setSocketOpen(true);
    },
  });

  const restartSocket = () => {
    /**
     * Since React batches state updates, we need to un-batch
     * them by using a setTimeout.
     */
    setSocketOpen(false);
    setTimeout(() => {
      setSocketOpen(true);
    }, 0);
  };

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

  const showHelp = (commands: Map<string, SlashCommandEntry>) => {
    const helpItems: Array<[string, string]> = [];
    for (const [command, { display, description }] of commands) {
      if (!display) continue;
      helpItems.push([`\\${command}`, description]);
    }
    commitToHistory(
      createDefaultLocalCommandOutput({
        command: "\\help",
        commandResults: helpItems,
      })
    );
  };

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
    if (socket === null || socketError) {
      return;
    }

    const stateMachine = getStateMachine();

    let prevWebSocketState: WebSocketFsmState["value"] | null = null;

    stateMachine.subscribe(({ value: newWebsocketState }) => {
      if (
        prevWebSocketState === null ||
        prevWebSocketState !== newWebsocketState
      ) {
        setShellState((prevState) => ({
          ...prevState,
          webSocketState: newWebsocketState,
        }));
      }
      prevWebSocketState = newWebsocketState;
    });

    const handleError = () => {
      commitToHistory(
        createDefaultNoticeOutput({
          message:
            "There was a problem executing your query. Please try again.",
          severity: "Error",
        })
      );

      restartSocket();
    };

    stateMachine.subscribe((state) => {
      if (
        !state.changed &&
        !state.matches("initialState") &&
        stateMachine.status !== InterpreterStatus.Stopped
      ) {
        captureException(new Error("Unsuccessful state machine transition"), {
          extra: {
            xState: state,
          },
        });
        handleError();
      }
    });

    stateMachine.start();

    const debouncedUpdateHistoryItem = debounce(
      updateHistoryItem,
      RECOIL_DEBOUNCE_WAIT_MS
    );

    socket.onResult((result) => {
      try {
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
      } catch (error) {
        captureException(error);
        handleError();
      }
    });

    return () => {
      stateMachine.stop();
      commitToHistory(
        createDefaultNoticeOutput({
          message:
            "The connection was interrupted. Some session state may have been lost.",
          severity: "Info",
        })
      );
    };
  }, [socket, socketError, commitToHistory, updateHistoryItem, setShellState]);

  const runCommand = (command: string) => {
    assert(socket);

    const stateMachine = getStateMachine();

    if (
      !stateMachine.state.matches("readyForQuery") ||
      !isSocketAvailable ||
      command.length === 0
    ) {
      return;
    }

    stateMachine.send({ type: "SEND", command });
    socket.send({ query: command });

    const { latestCommandOutput } = stateMachine.state.context;
    assert(latestCommandOutput);
    commitToHistory(latestCommandOutput);
  };

  type SlashCommandEntry = {
    callback: () => void;
    description: string;
    display: boolean;
  };

  const slashCommands: Map<string, SlashCommandEntry> = new Map([
    [
      "hacktheplanet",
      {
        callback: () =>
          setShellState((currentState) => ({
            ...currentState,
            crtEnabled: !currentState.crtEnabled,
          })),
        display: false,
        description: "Hack the planet!",
      },
    ],
    [
      "help",
      {
        callback: () => showHelp(slashCommands),
        display: true,
        description: "Show this help message",
      },
    ],
    [
      "clear",
      {
        callback: clearHistory,
        display: true,
        description: "Clear your displayed history",
      },
    ],
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
          handler.callback();
          setPrompt("");
          e.preventDefault();
          return false;
        }
      }
    }
    return true;
  };

  // TODO: Get rid of console logs
  console.debug("history", history);
  console.debug("state machine state", webSocketState);

  return (
    <Grid
      templateAreas={`
      "navbar navbar" 
      "shell tutorial"
      `}
      gridTemplateRows={`${NAVBAR_HEIGHT} minmax(0,1fr)`}
      gridTemplateColumns={`minmax(0,1fr) ${
        shellState.tutorialVisible ? TUTORIAL_WIDTH : 0
      }`}
      width="100%"
      height="100%"
    >
      <GridItem
        area="navbar"
        borderBottomWidth="1px"
        borderColor={colors.border.secondary}
        padding="6"
        display="flex"
        justifyContent="flex-end"
      >
        {shellState.tutorialVisible ? (
          <IconButton
            aria-label="Tutorial button"
            title="Close tutorial"
            icon={<CloseIcon height="2.5" width="2.5" />}
            isRound
            variant="secondary"
            size="sm"
            onClick={() =>
              setShellState((prevState) => ({
                ...prevState,
                tutorialVisible: false,
              }))
            }
          />
        ) : (
          <Button
            variant="secondary"
            title="Open tutorial"
            onClick={() =>
              setShellState((prevState) => ({
                ...prevState,
                tutorialVisible: true,
              }))
            }
            size="sm"
            leftIcon={<BookOpenIcon />}
            borderRadius="3xl"
          >
            Tutorial
          </Button>
        )}
      </GridItem>
      <GridItem area="shell" position="relative">
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
            flexShrink="0"
            minHeight="32"
            width="100%"
            onCommandBlockKeyDown={handlePromptInput}
            isSocketAvailable={isSocketAvailable}
          />
        </VStack>
        <RunCommandButton
          runCommand={runCommand}
          cancelStreaming={restartSocket}
          isSocketAvailable={isSocketAvailable}
          position="absolute"
          bottom="6"
          right="6"
        />
      </GridItem>
      {shellState.tutorialVisible && <Tutorial runCommand={runCommand} />}
    </Grid>
  );
};

export default Shell;
