import { SystemStyleObjectRecord } from "@chakra-ui/react";

interface TextStyle {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  letterSpacing: string;
  fontFeatureSettings?: string;
}

export interface TextStyles extends SystemStyleObjectRecord {
  "heading-xxl": TextStyle;
  "heading-xl": TextStyle;
  "heading-lg": TextStyle;
  "heading-md": TextStyle;
  "heading-sm": TextStyle;
  "heading-xs": TextStyle;
  "text-base": TextStyle;
  "text-small": TextStyle;
  "text-ui-med": TextStyle;
  "text-ui-reg": TextStyle;
  monospace: TextStyle;
}

export const typographySystem: TextStyles = {
  "heading-xxl": {
    fontFamily: "Inter",
    fontSize: "40px",
    lineHeight: "48px",
    fontWeight: "600",
    letterSpacing: "-0.008em",
  },
  "heading-xl": {
    fontFamily: "Inter",
    fontSize: "32px",
    lineHeight: "40px",
    fontWeight: "600",
    letterSpacing: "-0.008em",
  },
  "heading-lg": {
    fontFamily: "Inter",
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: "600",
    letterSpacing: "-0.008em",
  },
  "heading-md": {
    fontFamily: "Inter",
    fontSize: "20px",
    lineHeight: "24px",
    fontWeight: "500",
    letterSpacing: "-0.008em",
  },
  "heading-sm": {
    fontFamily: "Inter",
    fontSize: "18px",
    lineHeight: "24px",
    fontWeight: "500",
    letterSpacing: "-0.008em",
  },
  "heading-xs": {
    fontFamily: "Inter",
    fontSize: "16px",
    lineHeight: "20px",
    fontWeight: "500",
    letterSpacing: "-0.008em",
  },
  "text-base": {
    fontFamily: "Inter",
    fontSize: "14px",
    lineHeight: "24px",
    fontWeight: "400",
    letterSpacing: "-0.004em",
    fontFeatureSettings: "'tnum' on, 'lnum' on, 'cv06' on, 'cv10' on",
  },
  "text-small": {
    fontFamily: "Inter",
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: "400",
    letterSpacing: "-0.004em",
    fontFeatureSettings: "'tnum' on, 'lnum' on, 'cv06' on, 'cv10' on",
  },
  "text-ui-med": {
    fontFamily: "Inter",
    fontSize: "14px",
    lineHeight: "16px",
    fontWeight: "500",
    letterSpacing: "-0.006em",
    fontFeatureSettings: "'tnum' on, 'lnum' on, 'cv06' on, 'cv10' on",
  },
  "text-ui-reg": {
    fontFamily: "Inter",
    fontSize: "14px",
    lineHeight: "16px",
    fontWeight: "400",
    letterSpacing: "-0.006em",
    fontFeatureSettings: "'tnum' on, 'lnum' on, 'cv06' on, 'cv10' on",
  },
  monospace: {
    fontFamily: "Roboto Mono",
    fontSize: "14px",
    lineHeight: "24px",
    fontWeight: "400",
    letterSpacing: "auto",
  },
};
