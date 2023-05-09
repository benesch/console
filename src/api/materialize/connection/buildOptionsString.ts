import { attachNamespace } from "..";
import { Secret, TextSecret } from "./types";

export function buildOptionsString(
  options: [string, string | Secret | TextSecret | undefined][]
) {
  return options
    .filter(([_, value]) => Boolean(value))
    .map(([key, value]) => {
      // PORT is an integer and we shouldn't have quotations around it
      if (key === "PORT") {
        return `${key} ${value}`;
      }

      if (typeof value === "string") {
        return `${key} '${value}'`;
      }

      if ("secretTextValue" in value!) {
        return `${key} '${value.secretTextValue}'`;
      }

      if ("secretName" in value!) {
        const secret = attachNamespace(
          value.secretName,
          value.databaseName,
          value.schemaName
        );
        return `${key} SECRET ${secret}`;
      }

      return "";
    })
    .join(",\n");
}
