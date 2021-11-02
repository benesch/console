/**
 * @module utils/transformers
 * @description transform data from / to various formats
 *
 */

import { DateTime } from "luxon";

export const timestampToReadableTime = (timestamp: string) => {
  const dt = DateTime.fromISO(timestamp);
  return dt.toLocal().toFormat("HH:mm");
};
