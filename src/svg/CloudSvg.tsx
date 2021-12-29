import { useColorMode } from "@chakra-ui/react";
import React from "react";

import colors from "../theme/colors";

const CloudSvg = () => {
  const { colorMode } = useColorMode();
  const gradient =
    colorMode === "light" ? (
      <>
        <stop offset=".0114" stopColor={colors.indigo[500]} />
        <stop offset=".492" stopColor={colors.blue[400]} />
        <stop offset=".94" stopColor={colors.green[400]} />
      </>
    ) : (
      <>
        <stop offset=".015" stopColor={colors.indigo[400]} />
        <stop offset=".57" stopColor={colors.orchid[200]} />
        <stop offset=".86" stopColor={colors.orange[200]} />
      </>
    );
  return (
    <svg width="120" height="84" fill="none" xmlns="http://www.w3.org/2000/svg">
      <mask
        id="a"
        mask-type="alpha"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="120"
        height="84"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m95.373 39.472 1.692-4.416C97.664 33.493 98 31.783 98 30c0-7.728-6.272-14-14-14-2.874 0-5.552.874-7.765 2.359l-3.554 2.385-2.14-3.707C66.034 9.223 57.632 4 48 4 33.634 4 22 15.634 22 30c0 .42.016.852.035 1.37l.109 2.945-2.78.977C10.417 38.44 4 46.975 4 57c0 12.697 10.303 23 23 23h69c11.047 0 20-8.953 20-20 0-9.668-6.874-17.75-15.992-19.592l-4.635-.936Zm5.427-2.985a23.75 23.75 0 0 1 3.85 1.124C113.628 41.077 120 49.8 120 60c0 13.256-10.744 24-24 24H27C12.094 84 0 71.906 0 57c0-11.775 7.537-21.788 18.038-25.481A40.94 40.94 0 0 1 18 30C18 13.425 31.425 0 48 0c9.686 0 18.291 4.582 23.781 11.713a30.162 30.162 0 0 1 2.225 3.325A17.911 17.911 0 0 1 84 12c9.938 0 18 8.063 18 18a18.15 18.15 0 0 1-1.2 6.487Z"
          fill="#000"
        />
      </mask>
      <g mask="url(#a)">
        <path fill="url(#b)" d="M0 0h120v84H0z" />
      </g>
      <defs>
        <linearGradient
          id="b"
          x1="120"
          y1="90.168"
          x2="-6.857"
          y2="49.606"
          gradientUnits="userSpaceOnUse"
        >
          {gradient}
        </linearGradient>
      </defs>
    </svg>
  );
};

export default CloudSvg;
