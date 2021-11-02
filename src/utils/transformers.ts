/**
 * @module utils/transformers
 * @description transform data from / to various formats
 *
 */

import { DateTime } from "luxon";

export const timestampToReadableTime = (timestamp: number) => {
  const dt = DateTime.fromMillis(timestamp);
  return dt.toLocal().toFormat("HH:mm");
};
