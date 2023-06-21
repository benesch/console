import { Button, Input } from "@chakra-ui/react";
import { interpret, StateMachine } from "@xstate/fsm";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilCallback, useRecoilValue } from "recoil";

import { useSqlWs } from "~/api/materialize/websocket";
import { assert } from "~/util";

import WebSocketFsm, {
  WebSocketFsmContext,
  WebSocketFsmEvent,
  WebSocketFsmState,
} from "./machines/webSocketFsm";
import {
  createDefaultNoticeOutput,
  historyIdsAtom,
  HistoryItem,
  historyItemAtom,
  historySelector,
} from "./recoil/shell";

const Shell = () => {
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

  const [currentCommand, setCurrentCommand] = useState("");

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

  console.log(history);

  return (
    <>
      <Input
        value={currentCommand}
        onChange={(e) => setCurrentCommand(e.target.value)}
      ></Input>
      <Button onClick={() => runCommand(currentCommand)}>Run command</Button>
    </>
  );
};

export default Shell;
