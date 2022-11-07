import { useColorModeValue } from "@chakra-ui/react";
import React from "react";

import colors from "../theme/colors";

const animationStyles = `@keyframes bigBar {
    0% {
      opacity: 1;
      transform: translateX(0) translateY(0);
    }
  
    19% {
      opacity: 0;
      transform: translateX(30%) translateY(30%);
    }
    20% {
      transform: translateX(-100%) translateY(-100%);
      opacity: 0;
    }
    21% {
      opacity: 1;
    }
  
    70% {
      transform: translateX(0) translateY(0);
    }
  }
  
  @keyframes smallBar {
    0% {
      opacity: 1;
      transform: translateY(0);
    }
  
    49% {
      opacity: 0;
      transform: translateY(-100%);
    }
  
    50% {
      transform: translateY(100%);
    }
  
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .m-loading-mark .bar {
    animation-duration: 1.5s;
    animation-iteration-count: infinite;
  }
  
  .m-loading-mark .bar1 {
    animation-name: bigBar;
    animation-delay: 0;
  }
  
  .m-loading-mark .bar2 {
    animation-name: bigBar;
    animation-delay: 0.2s;
  }
  
  .m-loading-mark .bar3 {
    animation-name: bigBar;
    animation-delay: 0.4s;
  }
  
  .m-loading-mark .bar4 {
    animation-name: smallBar;
    animation-delay: 0.3s;
  }
  
  .m-loading-mark .bar5 {
    animation-name: smallBar;
    animation-delay: 0.6s;
  }`;

const LoadingSvg: React.FC<
  React.PropsWithChildren<{ fillColor?: string; width?: number }>
> = ({ fillColor, width = 128 }) => {
  const fillColorFromMode = useColorModeValue(colors.purple[700], "white");
  return (
    <svg
      className="m-loading-mark"
      width={width}
      viewBox="0 0 33.8232 27.916767"
      xmlns="http://www.w3.org/2000/svg"
      fill={fillColor ?? fillColorFromMode}
    >
      <style>{animationStyles}</style>
      <path
        className="bar bar1"
        d="m 8.52478,27.915467 c -2.74376,0 -5.48752,0 -8.231282,0 -0.2445817,0 -0.293498,-0.0489 -0.293498,-0.289 0,-2.7304 0,-5.4653 0,-8.2046 0.182324,0 0.257922,0.1734 0.369096,0.2801 2.629624,2.6119 5.254794,5.2311 7.875524,7.8578 0.10673,0.0934 0.27127,0.169 0.28016,0.3557 z"
      />
      <path
        className="bar bar3"
        d="m 25.0894,19.823367 c 0.6804,0.747 1.3963,1.4541 2.139,2.1345 0.0934,0.1067 0.1823,0.2223 0.2846,0.3246 1.2674,1.2674 2.5436,2.5214 3.8066,3.7933 0.6003,0.6092 1.2495,1.1739 1.7787,1.841 h -9.2051 c -0.0934,-0.1112 -0.1824,-0.2268 -0.2846,-0.3291 -1.509,-1.5001 -3.0195,-3.0046 -4.5315,-4.5136 C 13.9276,17.939267 8.77655,12.804567 3.62403,7.669847 2.42335,6.473617 1.25826,5.246267 0.00866699,4.112297 V 0.07891995 c 1.60534301,0 3.21513301,0 4.82492301,0 0.12791,-0.004631 0.25531,0.018399 0.3735,0.067517 0.11819,0.049117 0.22438,0.123166 0.31133,0.217087 C 9.76673,4.597007 14.018,8.830497 18.2722,13.063967 c 0.0833,0.0817 0.1709,0.1589 0.2624,0.2313 1.2496,1.2584 2.4947,2.5258 3.7532,3.7799 0.925,0.9249 1.8677,1.8321 2.8016,2.7482 z"
      />
      <path
        className="bar bar5"
        d="m 33.1117,27.916067 c -0.5426,-0.6671 -1.1918,-1.2319 -1.7788,-1.8411 -1.2629,-1.2718 -2.5392,-2.5258 -3.8066,-3.7932 -0.1023,-0.1023 -0.1912,-0.2179 -0.2846,-0.3246 v -0.5693 -19.46866 c -0.0057,-0.34409 0.1217,-0.67708 0.3558,-0.92941005 0.2486,-0.33855 0.5837,-0.60392 0.9703,-0.76824 1.569255,-0.33515738 4.7591,-0.1905133 4.7591,-0.1905133 0.3646,0 0.4696,0.1227333 0.4696,0.4695933 V 20.000467 l 0.0267,7.9156 z"
        fillOpacity="0.7"
      />
      <path
        className="bar bar2"
        d="m 0,16.358067 v -9.19184 c 0.137855,0.03113 0.209006,0.1512 0.297945,0.24458 l 2.841595,2.80606 c 5.23553,5.2207 10.47106,10.4414 15.70656,15.6621 0.6671,0.667 1.3741,1.3029 1.9745,2.0367 h -9.223 c 0,-0.1334 -0.1289,-0.1912 -0.209,-0.2713 -3.22254,-3.2196 -6.45102,-6.4362 -9.68542,-9.6498 -0.53662,-0.577 -1.105238,-1.1234 -1.70318,-1.6365 z"
      />
      <path
        className="bar bar4"
        d="m 25.089,19.822567 c -0.9339,-0.9161 -1.8766,-1.8233 -2.8016,-2.7482 -1.2585,-1.2541 -2.5036,-2.5214 -3.7532,-3.7799 0,-0.9783 0,-1.9522 0,-2.9306 -0.0098,-0.0999 0.0027,-0.2008 0.0365,-0.2954 0.0338,-0.0945 0.0882,-0.1805 0.1591,-0.2515 l 6.1235,-6.09233 c 0.0489,-0.04892 0.1112,-0.08894 0.1556,-0.12897 0.1379,0.04892 0.0979,0.1512 0.0979,0.2268 0,5.26221 0,10.5229 0,15.7822 -0.0014,0.0729 -0.0073,0.1457 -0.0178,0.2179 z"
        fillOpacity="0.7"
      />
    </svg>
  );
};

export default LoadingSvg;
