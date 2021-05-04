import React from "react";
import { BrowserRouter } from "react-router-dom";

import Router from "./Router";
import { AuthApolloProvider } from "./auth/AuthApolloProvider";

function App() {
  return (
    <AuthApolloProvider uri="/api/graphql">
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </AuthApolloProvider>
  );
}

export default App;
