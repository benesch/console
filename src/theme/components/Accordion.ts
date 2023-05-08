export const Accordion = {
  defaultProps: {
    variant: "borderless",
  },
  variants: {
    borderless: {
      container: {
        border: "none",
      },
      button: {
        p: 0,
        _hover: {
          background: "auto",
        },
      },
      panel: {
        mt: 6,
        p: 0,
      },
    },
  },
};
