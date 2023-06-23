import { Code, CodeProps, useTheme } from "@chakra-ui/react";
import { Global } from "@emotion/react";
import CodeEditor, {
  TextareaCodeEditorProps,
} from "@uiw/react-textarea-code-editor";
import React, { useRef } from "react";

import { MaterializeTheme } from "~/theme";

type CommandBlockProps = TextareaCodeEditorProps & {
  containerProps?: CodeProps;
  textAreaStyleProps?: React.CSSProperties;
};

const OverrideCodeEditorStyles = () => (
  <Global
    styles={(themeTokens: unknown) => {
      const mzThemeTokens = themeTokens as MaterializeTheme;
      return {
        "#shell .w-tc-editor": {
          "--color-fg-default": mzThemeTokens.colors.foreground.primary,
          "--color-prettylights-syntax-sublimelinter-gutter-mark":
            mzThemeTokens.colors.foreground.primary,
        },
      };
    }}
  />
);

export const CommandBlock = ({
  containerProps,
  textAreaStyleProps,
  ...rest
}: CommandBlockProps) => {
  const codeEditorRef = useRef<HTMLTextAreaElement | null>(null);
  const theme = useTheme<MaterializeTheme>();

  const handleContainerClick = () => {
    if (codeEditorRef !== null) {
      /*
        To allow vertical scrolling, we must change the overflow property of react-textarea-code-editor's
        container and not itself otherwise it leads to buggy behavior. 
      */
      codeEditorRef.current?.focus();
    }
  };

  const handleKeyDown = rest.readOnly
    ? () => {
        /* 
          Weird bug where even if the textarea is readonly, react-textarea-code-editor 
          will still update the value when pressing "tab". 
          A fix for this is to return false in onKeyDown's
          event handler.
          Source: https://github.com/uiwjs/react-textarea-code-editor/issues/133
        */
        return false;
      }
    : rest.onKeyDown;

  return (
    <Code
      {...(containerProps ?? {})}
      cursor="text"
      tabIndex={0}
      onClick={handleContainerClick}
    >
      <CodeEditor
        language="sql"
        style={{
          backgroundColor: "transparent",
          fontSize: theme.fontSizes.sm as string,
          ...(textAreaStyleProps ?? {}),
        }}
        padding={0}
        autoComplete="false"
        autoCorrect="false"
        onKeyDown={handleKeyDown}
        {...rest}
        ref={codeEditorRef}
      />
      <OverrideCodeEditorStyles />
    </Code>
  );
};

export default CommandBlock;
