import React from "react";

import colors from "~/theme/colors";

const CheckmarkIcon = () => {
  return (
    <svg
      width="16"
      height="17"
      viewBox="0 0 16 17"
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

export default CheckmarkIcon;
