export type Secret = {
  secretName: string;
  databaseName: string;
  schemaName: string;
};

// This type exists for DDL statements that allow a field to be a secret or text
export type TextSecret = {
  secretTextValue: string;
};
