import { formAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(formAnatomy.keys);

export const FORM_COLUMN_GAP = 60;

export const Form = defineMultiStyleConfig({
  variants: {
    leftAlignedLabel: definePartsStyle({
      container: {
        display: "grid",
        gridTemplateColumns: "min-content minmax(auto, 320px)",
        columnGap: "6",
        justifyContent: "space-between",
        alignItems: "center",
      },
    }),
  },
});
