import { getFronteggTheme } from "../../theme";

export const baseFronteggTheme = getFronteggTheme("light");

export const marketingBg = "#F9F9F9";

export const localFronteggSignupStyles = {
  body: {
    fontFamily: "intervariable",
    bg: `${marketingBg} !important`,
  },
  input: {
    color: "black",
  },
  ".input-label": {
    color: "red",
  },
  button: {
    bg: `${baseFronteggTheme.palette.primary.main} !important`,
    borderColor: "transparent !important",
    color: "white",
  },
  label: {
    color: "black",
    fontWeight: 600,
  },
  "input:hover": {
    borderWidth: "4px !important",
  },
  ".fe-sign-up__success-container": {
    color: "black",
  },
  ".fe-social-login__or-container": {
    display: "none !important",
  },
  "[data-test-id='googleSocialLogin-btn']": {
    display: "none !important",
  },
  "[data-test-id='githubSocialLogin-btn']": {
    display: "none !important",
  },
  ".grecaptcha-badge": {
    display: "none !important",
  },
};
