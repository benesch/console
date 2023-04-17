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
    fontFamily: "intervariable",
    fontSize: "40px",
    lineHeight: "48px",
    fontWeight: "600",
    letterSpacing: "-0.008em",
  },
  "heading-xl": {
    fontFamily: "intervariable",
    fontSize: "32px",
    lineHeight: "40px",
    fontWeight: "600",
    letterSpacing: "-0.008em",
  },
  "heading-lg": {
    fontFamily: "intervariable",
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: "600",
    letterSpacing: "-0.008em",
  },
  "heading-md": {
    fontFamily: "intervariable",
    fontSize: "20px",
    lineHeight: "24px",
    fontWeight: "500",
    letterSpacing: "-0.008em",
  },
  "heading-sm": {
    fontFamily: "intervariable",
    fontSize: "18px",
    lineHeight: "24px",
    fontWeight: "500",
    letterSpacing: "-0.008em",
  },
  "heading-xs": {
    fontFamily: "intervariable",
    fontSize: "16px",
    lineHeight: "20px",
    fontWeight: "500",
    letterSpacing: "-0.008em",
  },
  "text-base": {
    fontFamily: "intervariable",
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: "400",
    letterSpacing: "-0.004em",
    fontFeatureSettings: "'tnum' on, 'lnum' on, 'cv06' on, 'cv10' on",
  },
  "text-small": {
    fontFamily: "intervariable",
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: "400",
    letterSpacing: "-0.004em",
    fontFeatureSettings: "'tnum' on, 'lnum' on, 'cv06' on, 'cv10' on",
  },
  "text-ui-med": {
    fontFamily: "intervariable",
    fontSize: "14px",
    lineHeight: "16px",
    fontWeight: "500",
    letterSpacing: "-0.006em",
    fontFeatureSettings: "'tnum' on, 'lnum' on, 'cv06' on, 'cv10' on",
  },
  "text-ui-reg": {
    fontFamily: "intervariable",
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
