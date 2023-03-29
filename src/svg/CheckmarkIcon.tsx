import React from "react";

import colors from "~/theme/colors";

export const CheckmarkIcon = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.3337 4.43945L6.00033 11.7728L2.66699 8.43945"
        stroke={colors.green[500]}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const CheckmarkIconWithCircle = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="24"
        height="24"
        rx="12"
        fill={colors.green[500]}
        fillOpacity="0.16"
      />
      <path
        d="M17.3327 9L9.99935 16.3333L6.66602 13"
        stroke={colors.green[500]}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CheckmarkIcon;
