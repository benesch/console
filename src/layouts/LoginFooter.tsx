import React from "react";

// Note that this must be a non-dynamic element, and must use no other
// dynamic elements (like chakra-ui's). Best stick to plain HTML here.
const LoginFooter = () => (
  <p>
    Don&lsquo;t have an account?{" "}
    <a href="https://materialize.com/materialize-cloud-access/">Sign up.</a>
  </p>
);

export default LoginFooter;
