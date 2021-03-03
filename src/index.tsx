import "semantic-ui-css/semantic.min.css";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { UserProvider } from "./auth/AuthContext";
import config from "./config";

const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.render(
  <React.StrictMode>
    <UserProvider
      region={config.cognitoRegion}
      userPoolId={config.cognitoUserPoolId}
      userPoolWebClientId={config.cognitoWebClientId}
    >
      <App />
    </UserProvider>
  </React.StrictMode>,
  root
);
