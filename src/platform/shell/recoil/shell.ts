import { atom, atomFamily, selector } from "recoil";
import { v4 as uuidv4 } from "uuid";

import { Error, Notice } from "~/api/materialize/types";

import keys from "./keyConstants";

type ShellState = {
  page: "start" | "shell";
  tutorialVisible: boolean;
};

const initialShellState = {
  page: "start" as const,
  tutorialVisible: false,
  queryStatus: "pending" as const,
};

export const shellStateAtom = atom<ShellState>({
  key: keys.SHELL_STATE,
  default: initialShellState,
});

export const historyIdsAtom = atom<string[]>({
  key: keys.HISTORY_IDS,
  default: [],
});

type HistoryId = string;

type CommandResult = {
  isStreamingResult: boolean;

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

export const historySelector = selector({
  key: "HISTORY_SELECTOR",
  get: ({ get }) => {
    const historyIds = get(historyIdsAtom);

    return historyIds.map((id) => {
      return get(historyItemAtom(id));
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
  initialTimeMs?: number;
}): CommandResult {
  return {
    isStreamingResult: payload.isStreamingResult,
    notices: [],
    initialTimeMs: payload.initialTimeMs,
  };
}
