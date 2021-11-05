/**
 * @module utils/transformers
 * @description transform data from / to various formats
 *
 */

import { DateTime } from "luxon";

export const formatToReadableTime = (datetime: Date) => {
  const dt = DateTime.fromJSDate(datetime);
  return dt.toLocal().toFormat("HH:mm");
};
