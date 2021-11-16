import { ChakraProvider } from "@chakra-ui/react";
import { render } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router";
import { RestfulProvider } from "restful-react";

import { testApiBase } from "../api/__mocks__/api";

export const renderFragmentInTestMode = (fragment: React.ReactNode) => {
  return render(
    <ChakraProvider>
      <MemoryRouter>
        <RestfulProvider base={testApiBase}>{fragment}</RestfulProvider>
      </MemoryRouter>
    </ChakraProvider>
  );
};
