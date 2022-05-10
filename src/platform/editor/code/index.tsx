import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/theme/monokai.css";
import "codemirror/theme/panda-syntax.css";
import "codemirror/mode/sql/sql";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/sql-hint";
import "codemirror/addon/hint/show-hint.css";

import { Box, Button } from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";

interface Props {
  handleQuery: (query: string) => void;
}

const Code = (props: Props): JSX.Element => {
  const { handleQuery } = props;

  /**
   * State
   */
  const [query, setQuery] = useState<string>("");

  /**
   * Handlers
   */
  const onClick = useCallback(() => {
    handleQuery(query);
  }, [handleQuery, query]);

  const onBeforeChange = useCallback((editor, data, value) => {
    setQuery(value);
  }, []);

  return (
    <Box width={"100%"} position="relative" overflow={"scroll"}>
      <Button
        height="1.75rem"
        size="sm"
        onClick={onClick}
        position="absolute"
        zIndex={1}
        top={2}
        right={2}
        backgroundColor={"green.700"}
        _hover={{
          backgroundColor: "green.500",
        }}
      >
        Run
      </Button>
      <CodeMirror
        value={query}
        onBeforeChange={onBeforeChange}
        options={{
          mode: "text/x-pgsql",
          theme: "material",
          lineNumbers: true,
        }}
      />
    </Box>
  );
};

export default Code;
