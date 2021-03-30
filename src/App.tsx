import React from "react";
import { BrowserRouter } from "react-router-dom";

import Router from "./Router";
import { AuthApolloProvider } from "./auth/AuthApolloProvider";

import "./App.css";

function App() {
  return (
    <AuthApolloProvider uri="/graphql">
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </AuthApolloProvider>
  );
}

export default App;
