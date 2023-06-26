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
        color: "accent.brightPurple",
        lineHeight: "16px",
        p: 0,
        _hover: {
          background: "auto",
        },
      },
      icon: {
        width: "16px",
        height: "16px",
      },
      panel: {
        mt: 2,
        p: 0,
      },
    },
  },
};
