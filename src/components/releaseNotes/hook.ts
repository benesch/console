import { useState } from "react";

import {
  getLastAckReleaseNoteId,
  getMostRecentReleaseNoteId,
  getReleaseNotesRootURL,
  setLastAckReleaseNoteId,
} from "./releaseNote";

export const shouldDisplayWhatsNewLink = (): boolean => {
  const currentReleaseNoteId = getMostRecentReleaseNoteId();
  const lastReleaseNoteIdSeen = getLastAckReleaseNoteId();

  // if the provided changelog is not a valid string, we don't want to display the link
  if (!(currentReleaseNoteId && currentReleaseNoteId !== "")) return false;
  // if the user has not seen the changelog before, we want to display the link
  if (lastReleaseNoteIdSeen === null) {
    return true;
  }

  return currentReleaseNoteId !== lastReleaseNoteIdSeen;
};

export const useWhatsNew = () => {
  const [displayWhatsNew] = useState(shouldDisplayWhatsNewLink());

  const onLinkClicked = () => {
    console.log("set the current cache with", getMostRecentReleaseNoteId());
    setLastAckReleaseNoteId(getMostRecentReleaseNoteId());
  };

  const releaseNoteLink = `${getReleaseNotesRootURL()}/${getMostRecentReleaseNoteId()}`;

  return {
    visible: displayWhatsNew,
    onLinkClicked,
    releaseNoteLink,
  };
};
