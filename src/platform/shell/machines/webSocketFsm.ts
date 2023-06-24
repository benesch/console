import { assign, createMachine } from "@xstate/fsm";
import { produce } from "immer";

import { Error, Notice } from "~/api/materialize/types";
import { assert } from "~/util";

import {
  CommandOutput,
  createDefaultCommandOutput,
  createDefaultCommandResult,
} from "../recoil/shell";

type SendEvent = { type: "SEND"; command: string };
type CommandStartingIsStreamingEvent = {
  type: "COMMAND_STARTING_IS_STREAMING";
  hasRows: boolean;
};
type CommandStartingHasRowsEvent = { type: "COMMAND_STARTING_HAS_ROWS" };
type CommandStartingDefaultEvent = { type: "COMMAND_STARTING_DEFAULT" };
type CommandCompleteEvent = {
  type: "COMMAND_COMPLETE";
  commandCompletePayload: string;
};
type RowsEvent = { type: "ROWS"; rows: string[] };
type RowEvent = { type: "ROW"; row: unknown[] };
type ErrorEvent = { type: "ERROR"; error: Error };
type NoticeEvent = { type: "NOTICE"; notice: Notice };
type ReadyForQueryEvent = { type: "READY_FOR_QUERY" };

export type WebSocketFsmContext = {
  latestCommandOutput?: CommandOutput;
};

export type WebSocketFsmEvent =
  | SendEvent
  | CommandStartingIsStreamingEvent
  | CommandStartingHasRowsEvent
  | CommandStartingDefaultEvent
  | CommandCompleteEvent
  | RowsEvent
  | RowEvent
  | ErrorEvent
  | NoticeEvent
  | ReadyForQueryEvent;

export type WebSocketFsmState =
  | {
      value: "initialState";
      context: WebSocketFsmContext;
    }
  | {
      value: "readyForQuery";
      context: WebSocketFsmContext;
    }
  | {
      value: "commandSent";
      context: WebSocketFsmContext;
    }
  | {
      value: "commandInProgressDefault";
      context: WebSocketFsmContext;
    }
  | {
      value: "commandInProgressHasRows";
      context: WebSocketFsmContext;
    }
  | {
      value: "commandInProgressStreaming";
      context: WebSocketFsmContext;
    };

export type StateMachineState = WebSocketFsmState["value"];

const addDefaultCommandResult = assign<WebSocketFsmContext>({
  latestCommandOutput: ({ latestCommandOutput }) =>
    produce(latestCommandOutput, (draft) => {
      assert(draft);
      draft.commandResults.push(
        createDefaultCommandResult({
          isStreamingResult: false,
          hasRows: false,
          initialTimeMs: performance.now(),
        })
      );
    }),
});

const addHasRowsCommandResult = assign<WebSocketFsmContext>({
  latestCommandOutput: ({ latestCommandOutput }) =>
    produce(latestCommandOutput, (draft) => {
      assert(draft);
      draft.commandResults.push(
        createDefaultCommandResult({
          isStreamingResult: false,
          hasRows: true,
          initialTimeMs: performance.now(),
        })
      );
    }),
});

const addStreamingCommandResult = assign<
  WebSocketFsmContext,
  CommandStartingIsStreamingEvent
>({
  latestCommandOutput: ({ latestCommandOutput }, event) =>
    produce(latestCommandOutput, (draft) => {
      assert(draft);
      draft.commandResults.push(
        createDefaultCommandResult({
          isStreamingResult: true,
          hasRows: event.hasRows,
          initialTimeMs: performance.now(),
        })
      );
    }),
});

const addNoticeToLatestCommandResult = assign<WebSocketFsmContext, NoticeEvent>(
  {
    latestCommandOutput: ({ latestCommandOutput }, event) =>
      produce(latestCommandOutput, (draft) => {
        assert(draft);
        const latestCommandResult = draft.commandResults.at(-1);
        assert(latestCommandResult);
        latestCommandResult.notices.push(event.notice);
      }),
  }
);

const addErrorToLatestCommandResult = assign<WebSocketFsmContext, ErrorEvent>({
  latestCommandOutput: ({ latestCommandOutput }, event) =>
    produce(latestCommandOutput, (draft) => {
      assert(draft);
      const latestCommandResult = draft.commandResults.at(-1);
      assert(latestCommandResult);
      latestCommandResult.endTimeMs = performance.now();
      latestCommandResult.error = event.error;
    }),
});

const addRowsToLatestCommandResult = assign<WebSocketFsmContext, RowsEvent>({
  latestCommandOutput: ({ latestCommandOutput }, event) =>
    produce(latestCommandOutput, (draft) => {
      assert(draft);
      const latestCommandResult = draft.commandResults.at(-1);
      assert(latestCommandResult);
      latestCommandResult.cols = event.rows;
    }),
});

const addRowToLatestCommandResult = assign<WebSocketFsmContext, RowEvent>({
  latestCommandOutput: ({ latestCommandOutput }, event) =>
    produce(latestCommandOutput, (draft) => {
      assert(draft);
      const latestCommandResult = draft.commandResults.at(-1);
      assert(latestCommandResult);
      if (!latestCommandResult.rows) {
        latestCommandResult.rows = [];
      }
      latestCommandResult.rows.push(event.row);
    }),
});

const completeLatestCommandResult = assign<
  WebSocketFsmContext,
  CommandCompleteEvent
>({
  latestCommandOutput: ({ latestCommandOutput }, event) =>
    produce(latestCommandOutput, (draft) => {
      assert(draft);
      const latestCommandResult = draft.commandResults.at(-1);
      assert(latestCommandResult);
      latestCommandResult.commandCompletePayload = event.commandCompletePayload;
      latestCommandResult.endTimeMs = performance.now();
    }),
});

export const webSocketFsm = createMachine<
  WebSocketFsmContext,
  WebSocketFsmEvent,
  WebSocketFsmState
>({
  id: "webSocketFsm",
  initial: "initialState",
  states: {
    initialState: {
      on: {
        READY_FOR_QUERY: {
          target: "readyForQuery",
          actions: assign({}),
        },
      },
    },
    readyForQuery: {
      on: {
        SEND: {
          target: "commandSent",
          actions: assign({
            latestCommandOutput: (_, event) =>
              createDefaultCommandOutput({
                command: event.command,
              }),
          }),
        },
      },
    },
    commandSent: {
      on: {
        COMMAND_STARTING_DEFAULT: {
          target: "commandInProgressDefault",
          actions: addDefaultCommandResult,
        },
        COMMAND_STARTING_HAS_ROWS: {
          target: "commandInProgressHasRows",
          actions: addHasRowsCommandResult,
        },
        COMMAND_STARTING_IS_STREAMING: {
          target: "commandInProgressStreaming",
          actions: addStreamingCommandResult,
        },
        NOTICE: {
          target: "commandSent",
          actions: assign({
            latestCommandOutput: ({ latestCommandOutput }, event) =>
              produce(latestCommandOutput, (draft) => {
                assert(draft);
                const { commandResults } = draft;
                if (commandResults.length > 0) {
                  const latestCommandResult = commandResults.at(-1);
                  assert(latestCommandResult);
                  latestCommandResult.notices.push(event.notice);
                } else {
                  draft.notices.push(event.notice);
                }
              }),
          }),
        },
        ERROR: {
          target: "commandSent",
          actions: assign({
            latestCommandOutput: ({ latestCommandOutput }, event) =>
              produce(latestCommandOutput, (draft) => {
                assert(draft);
                draft.error = event.error;
              }),
          }),
        },
        READY_FOR_QUERY: {
          target: "readyForQuery",
          actions: assign({}),
        },
      },
    },
    commandInProgressDefault: {
      on: {
        COMMAND_COMPLETE: {
          target: "commandSent",
          actions: completeLatestCommandResult,
        },
        NOTICE: {
          target: "commandInProgressHasRows",
          actions: addNoticeToLatestCommandResult,
        },
        ERROR: {
          target: "commandSent",
          actions: addErrorToLatestCommandResult,
        },
      },
    },
    commandInProgressHasRows: {
      on: {
        COMMAND_COMPLETE: {
          target: "commandSent",
          actions: completeLatestCommandResult,
        },
        NOTICE: {
          target: "commandInProgressHasRows",
          actions: addNoticeToLatestCommandResult,
        },
        ERROR: {
          target: "commandSent",
          actions: addErrorToLatestCommandResult,
        },
        ROWS: {
          target: "commandInProgressHasRows",
          actions: addRowsToLatestCommandResult,
        },
        ROW: {
          target: "commandInProgressHasRows",
          actions: addRowToLatestCommandResult,
        },
      },
    },
    commandInProgressStreaming: {
      on: {
        NOTICE: {
          target: "commandInProgressStreaming",
          actions: addNoticeToLatestCommandResult,
        },
        ERROR: {
          target: "commandSent",
          actions: addErrorToLatestCommandResult,
        },
        ROWS: {
          target: "commandInProgressStreaming",
          actions: addRowsToLatestCommandResult,
        },
        ROW: {
          target: "commandInProgressStreaming",
          actions: addRowToLatestCommandResult,
        },
        COMMAND_COMPLETE: {
          target: "commandSent",
          actions: completeLatestCommandResult,
        },
      },
    },
  },
});

export default webSocketFsm;
