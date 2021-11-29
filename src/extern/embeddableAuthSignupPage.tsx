import { Box } from "@chakra-ui/layout";
import { css } from "@chakra-ui/system";
import { Global } from "@emotion/react";
import { AuthPlugin, SignUp } from "@frontegg/react-auth";
import { FronteggProvider } from "@frontegg/react-core";
import * as React from "react";

import { getFronteggTheme } from "../theme";
import { marketingBg } from "./styles";

const baseFronteggTheme = getFronteggTheme("light");

export const fixupStates = {
  removeElements: false,
  removeLoginLink: false,
  fixSignUpFormStyles: false,
};

const removeLoginLinkIfExist = () => {
  if (fixupStates.removeLoginLink) return;
  const loginLinkSelector = ".fe-sign-up__back-to-login-link";
  const loginLink = document.querySelector(loginLinkSelector);
  const loginLinkParent = loginLink?.parentElement;
  if (loginLink && loginLinkParent) {
    loginLinkParent.style.display = "none";
    fixupStates.removeLoginLink = true;
  }
};

const fixSignUpFormIfExist = () => {
  if (fixupStates.fixSignUpFormStyles) return;

  const inputsSelector = [
    "[data-test-id='signupSubmit-btn']",
    "[name=name]",
    "[name=email]",
    "[name=companyName]",
  ];

  const inputs = inputsSelector.map((selector) =>
    document.querySelector(selector)
  );
  const allElementsExist = inputs.every((input) => input !== null);

  if (!allElementsExist) {
    return;
  }

  const labels = ["Name", "Email", "Company Name"];
  const [_submit, nameInput, emailInput, companyInput] = inputs;

  ([nameInput, emailInput, companyInput] as HTMLInputElement[]).forEach(
    (input, index) => {
      const label = document.createElement("label");
      label.innerText = labels[index];
      label["htmlFor"] = input.name;
      input.parentElement?.insertAdjacentElement("beforebegin", label);
    }
  );

  fixupStates.fixSignUpFormStyles = true;
};

const socialLoginsMutationObserver = new MutationObserver(() => {
  if (
    [fixupStates.fixSignUpFormStyles, fixupStates.removeLoginLink].every(
      (indicator) => Boolean(indicator)
    )
  ) {
    socialLoginsMutationObserver.disconnect();
    return;
  }

  removeLoginLinkIfExist();
  fixSignUpFormIfExist();
});

export const useEmbeddedAuthSignupPage = () => {
  React.useEffect(() => {
    socialLoginsMutationObserver.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    return socialLoginsMutationObserver.disconnect;
  }, []);
};

export const EmbeddableAuthSignupPage = () => {
  useEmbeddedAuthSignupPage();
  return (
    <>
      <Global
        styles={css({
          body: {
            fontFamily: "intervariable",
            bg: `${marketingBg} !important`,
          },
          input: {
            color: "black",
          },
          ".input-label": {
            color: "red",
          },
          button: {
            bg: `${baseFronteggTheme.palette.primary.main} !important`,
            borderColor: "transparent !important",
            color: "white",
          },
          label: {
            color: "black",
            fontWeight: 600,
          },
          "input:hover": {
            borderWidth: "4px !important",
          },
          ".fe-sign-up__success-container": {
            color: "black",
          },
          ".fe-social-login__or-container": {
            display: "none !important",
          },
          "[data-test-id='googleSocialLogin-btn']": {
            display: "none !important",
          },
          "[data-test-id='githubSocialLogin-btn']": {
            display: "none !important",
          },
          ".grecaptcha-badge": {
            display: "none !important",
          },
        })}
      ></Global>
      <FronteggProvider
        context={{
          baseUrl: window.CONFIG.fronteggUrl,
          theme: getFronteggTheme("light"),
        }}
        plugins={[AuthPlugin()]}
      >
        <Box height="100vh">
          <SignUp />
        </Box>
      </FronteggProvider>
    </>
  );
};
