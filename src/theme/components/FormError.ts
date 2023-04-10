import { formErrorAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(formErrorAnatomy.keys);

export const FormError = defineMultiStyleConfig({
  variants: {
    spanColumns: definePartsStyle({
      text: {
        gridColumnEnd: "span 2",
      },
    }),
  },
});
