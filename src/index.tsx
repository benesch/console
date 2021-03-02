import "semantic-ui-css/semantic.min.css";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { UserProvider } from "./auth/AuthContext";

ReactDOM.render(
  <React.StrictMode>
    <UserProvider
      region="us-east-2"
      userPoolId="us-east-2_GbM7D8ZVg"
      userPoolWebClientId="7st072o8h1lhfj66mjf9vbcauo"
    >
      <App />
    </UserProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
