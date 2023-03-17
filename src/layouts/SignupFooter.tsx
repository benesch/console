import React from "react";

// Note that this must be a non-dynamic element, and must use no other
// dynamic elements (like chakra-ui's). Best stick to plain HTML here.
const SignupFooter = (
  <p>
    By signing up for Materialize, you agree to our{" "}
    <a
      target="_blank"
      rel="noreferrer"
      href="https://materialize.com/terms-and-conditions/"
    >
      Terms and Conditions
    </a>
    .
  </p>
);

export default SignupFooter;
