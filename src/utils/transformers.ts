/**
 * @module utils/transformers
 * @description transform data from / to various formats
 *
 */

import format from "date-fns/format";

export const isValidDate = (d: any) => d instanceof Date && !isNaN(d as any);
export const formatToReadableTime = (datetime: Date) => {
  if (!isValidDate(datetime)) {
    return "";
  }
  return format(datetime, "HH:mm");
};
