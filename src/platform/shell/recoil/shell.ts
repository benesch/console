import { atom, atomFamily, selector, selectorFamily } from "recoil";
import { v4 as uuidv4 } from "uuid";

import { Error, Notice } from "~/api/materialize/types";
import { assert } from "~/util";

import { WebSocketFsmState } from "../machines/webSocketFsm";
import keys from "./keyConstants";

type ShellState = {
  page: "start" | "shell";
  tutorialVisible: boolean;
  queryStatus: "pending";
  crtEnabled: boolean;
  webSocketState: WebSocketFsmState["value"] | null;
};

const initialShellState = {
  page: "start" as const,
  tutorialVisible: false,
  queryStatus: "pending" as const,
  crtEnabled: false,
  webSocketState: null,
};

export const shellStateAtom = atom<ShellState>({
  key: keys.SHELL_STATE,
  default: initialShellState,
});

export const promptAtom = atom<string>({
  key: keys.PROMPT,
  default: "",
});

export const historyIdsAtom = atom<string[]>({
  key: keys.HISTORY_IDS,
  default: [],
});

export type HistoryId = string;

type CommandResult = {
  isStreamingResult: boolean;
  hasRows: boolean;

  notices: Notice[];
  error?: Error;
  commandCompletePayload?: string;

  cols?: string[];
  rows?: unknown[][];
  initialTimeMs?: number;
  endTimeMs?: number;
};

/**
 * Represents the output of line block in the shell
 */
export type CommandOutput = {
  kind: "command";
  historyId: HistoryId;
  // The query string
  command: string;
  // Notices rendered after the command statement but before each result
  notices: Notice[];
  error?: Error;
  // When a command contains multiple statements such as "SELECT 1; SELECT 1; SELECT 1;"
  commandResults: CommandResult[];
};

export type NoticeOutput = Notice & {
  kind: "notice";
  historyId: HistoryId;
};

export type HistoryItem = CommandOutput | NoticeOutput;

export const historyItemAtom = atomFamily<HistoryItem, HistoryId>({
  key: keys.HISTORY,
});

// TODO: Get rid. Used for debugging purposes.
export const historySelector = selector({
  key: "HISTORY_SELECTOR",
  get: ({ get }) => {
    const historyIds = get(historyIdsAtom);

    return historyIds.map((id) => {
      return get(historyItemAtom(id));
    });
  },
});

// Copied from https://materialize.com/docs/sql/subscribe/#output
const SUBSCRIBE_METADATA_COLUMNS = ["mz_timestamp", "mz_progressed", "mz_diff"];

/**
 *
 * A SUBSCRIBE command's output consists of an array of row where each
 * row has an `mz_diff` column which indicates the copies of the row inserted.
 * If mz_diff is negative, it indicates the copies of the row deleted.
 *
 * This function computes the current state of the output given mz_diff.
 *
 */
function mergeMzDiffs(commandResult: CommandResult): CommandResult {
  if (
    !commandResult.isStreamingResult ||
    !commandResult.hasRows ||
    !commandResult.cols ||
    !commandResult.rows
  ) {
    return commandResult;
  }

  const newCols = commandResult.cols.filter(
    (col) => !SUBSCRIBE_METADATA_COLUMNS.includes(col)
  );

  const reservedSubscribeColumnsIndicesByCol = commandResult.cols.reduceRight(
    (accum, col, colIndex) => {
      if (SUBSCRIBE_METADATA_COLUMNS.includes(col)) {
        accum.set(col, colIndex);
      }
      return accum;
    },
    new Map<string, number>()
  );

  const reservedSubscribeColumnsIndices = new Set(
    reservedSubscribeColumnsIndicesByCol.values()
  );

  const mzDiffIndex = reservedSubscribeColumnsIndicesByCol.get("mz_diff");

  assert(mzDiffIndex);

  const rowDiffMap = commandResult.rows.reduce((accum, row) => {
    const rowWithoutReservedColumns = row.filter(
      (_, rowIndex) => !reservedSubscribeColumnsIndices.has(rowIndex)
    );

    const rowHash = JSON.stringify(rowWithoutReservedColumns);

    const diff = row[mzDiffIndex] as number;

    let { count } = accum.get(rowHash) ?? {}; // A row's mz_diff value

    count = count ? count + diff : diff;

    if (count <= 0) {
      accum.delete(rowHash);
    } else {
      accum.set(rowHash, { count, row: rowWithoutReservedColumns });
    }

    return accum;
  }, new Map<string, { count: number; row: unknown[] }>());

  const newRows = [...rowDiffMap.entries()].map(([_, { row }]) => row);

  return {
    ...commandResult,
    cols: newCols,
    rows: newRows,
  };
}

export const historyItemCommandResultsSelector = selectorFamily({
  key: keys.SUBSCRIBE_TABLE_SELECTOR,
  get:
    (historyId: HistoryId) =>
    ({ get }) => {
      const historyItem = get(historyItemAtom(historyId));

      if (historyItem.kind !== "command") {
        return undefined;
      }

      return historyItem.commandResults.map((commandResult) => {
        const { isStreamingResult, hasRows } = commandResult;

        if (!isStreamingResult || !hasRows) {
          return commandResult;
        }
        return mergeMzDiffs(commandResult);
      });
    },
});

export function createDefaultCommandOutput(payload: {
  command: string;
}): CommandOutput {
  return {
    kind: "command",
    historyId: uuidv4(),
    command: payload.command,
    commandResults: [],
    notices: [],
  };
}

export function createDefaultNoticeOutput(payload: Notice): NoticeOutput {
  return {
    ...payload,
    kind: "notice" as const,
    historyId: uuidv4(),
  };
}

export function createDefaultCommandResult(payload: {
  isStreamingResult: boolean;
  hasRows: boolean;
  initialTimeMs?: number;
}): CommandResult {
  return {
    isStreamingResult: payload.isStreamingResult,
    hasRows: payload.hasRows,
    notices: [],
    initialTimeMs: payload.initialTimeMs,
  };
}
