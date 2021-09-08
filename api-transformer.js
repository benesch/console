// A preprocessing hook for restful-react code generation.
//
// restful-react assumes that API endpoints that have a content type other than
// "*/*", "application/json", or "application/octet-stream" have a schema of
// "void" [0]. But we have an endpoint that returns "text/plain" that has a
// schema of "string".
//
// In general, all of our API endpoints have a correct schema, regardless of
// what content type they specify. So just rewrite any content types that are
// not "application/json" to be "*/*" so that restful-react generates correct
// types.
//
// [0]: https://github.com/contiamo/restful-react/blob/0f21924fe/src/scripts/import-open-api.ts#L223-L225

module.exports = (schema) => {
  for (const [_, methods] of Object.entries(schema.paths)) {
    for (const [_, operation] of Object.entries(methods)) {
      for (const [_, response] of Object.entries(operation.responses)) {
        if (response.content) {
          const contentTypes = Object.keys(response.content);
          if (
            contentTypes.length === 1 &&
            contentTypes[0] !== "application/json"
          ) {
            const schema = response.content[contentTypes[0]];
            delete response.content[contentTypes[0]];
            response.content["*/*"] = schema;
          }
        }
      }
    }
  }
  return schema;
};
