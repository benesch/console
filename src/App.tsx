import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Container, Menu } from "semantic-ui-react";

import "./App.css";

import Nav from "./Nav";
import Router from "./Router";
import AuthApolloProvider from "./auth/AuthApolloProvider";

function App() {
  return (
    <AuthApolloProvider uri="/graphql">
      <BrowserRouter>
        <Nav />
        <Container text>
          <Router />
        </Container>
        <Menu fixed="bottom" inverted>
          <Menu.Item>© {new Date().getFullYear()} Materialize</Menu.Item>
        </Menu>
      </BrowserRouter>
    </AuthApolloProvider>
  );
}

export default App;
