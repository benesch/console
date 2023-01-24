import React, { SVGProps } from "react";

export interface ChevronProps extends SVGProps<SVGSVGElement> {
  direction: "up" | "down";
}
const Chevron = ({ direction, ...props }: ChevronProps) => {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      transform={direction === "down" ? "rotate(180)" : ""}
      {...props}
    >
      <path
        d="M3 7.5L6 4.5L9 7.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Chevron;
