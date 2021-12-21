export const LAST_RELEASENOTEID_KEY = "mz_last_releasenoteid";

export const getReleaseNotesRootURL = (): string | null => {
  return window.CONFIG.releaseNotesRootURL;
};
export const getMostRecentReleaseNoteId = (): string | null => {
  return window.CONFIG.lastReleaseNoteId;
};

export const getLastAckReleaseNoteId = (): string | null =>
  (window.localStorage &&
    window.localStorage.getItem(LAST_RELEASENOTEID_KEY)) ??
  null;

export const setLastAckReleaseNoteId = (id: string | null) =>
  id &&
  window.localStorage &&
  window.localStorage.setItem(LAST_RELEASENOTEID_KEY, id);
