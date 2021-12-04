import React from "react";

import { sendFinishedMessageToParentFrame } from "./events";

export class EmbeddableSignupDOMHandler {
  selectors = {
    loginLink: ".fe-sign-up__back-to-login-link",
  };

  state = {
    loginLinkIsHidden: false,
    formIsFixed: false,
    signupSuccess: false,
  };

  get shouldStopListeningForChanges() {
    return (
      this.state.loginLinkIsHidden &&
      this.state.formIsFixed &&
      this.state.signupSuccess
    );
  }

  mutationObserver = new MutationObserver(() => this.onDOMChange());

  /**
   * By default the frontegg signup component will display a link to come back to login
   * However when embeded in the marketing website, the link is not needed. After signup, we want to stay on the terminal state
   */
  removeLoginLinkIfExist = () => {
    if (this.state.loginLinkIsHidden) return;
    const loginLinkSelector = ".fe-sign-up__back-to-login-link";
    const loginLink = document.querySelector(loginLinkSelector);
    const loginLinkParent = loginLink?.parentElement;
    if (loginLink && loginLinkParent) {
      loginLinkParent.style.display = "none";
      this.state.loginLinkIsHidden = true;
    }
  };

  /**
   * By default, the frontegg SignUp component does not let us to customize the colors of the submit button and does not display labels on form fields
   * This method will attempt to fix this issue
   * @returns
   */
  fixSignUpFormIfExist = () => {
    if (this.state.formIsFixed) return;

    const elements = this.elementFromSelectors([
      "[data-test-id='signupSubmit-btn']",
      "[name=name]",
      "[name=email]",
      "[name=companyName]",
    ]);

    if (!this.allElementsDefined(elements)) {
      return;
    }

    const labels = ["Name", "Email", "Company Name"];
    const [_submit, ...inputs] = elements;

    inputs.forEach((input, index) => {
      const label = document.createElement("label");
      label.innerText = labels[index];
      label["htmlFor"] = (input as HTMLInputElement).name;
      input.parentElement?.insertAdjacentElement("beforebegin", label);
    });

    this.state.formIsFixed = true;
  };

  sendSuccessEventIfSignupSuccessful = () => {
    const signupSuccessful = document.querySelector(
      ".fe-sign-up__success-container"
    );
    if (signupSuccessful) {
      sendFinishedMessageToParentFrame();
      this.state.signupSuccess = true;
    }
  };

  onDOMChange() {
    if (this.shouldStopListeningForChanges) {
      this.disconnect();
      return;
    }
    this.removeLoginLinkIfExist();
    this.fixSignUpFormIfExist();
    this.sendSuccessEventIfSignupSuccessful();
  }

  /** Start to listen on DOM Changes on the page */
  observe() {
    this.mutationObserver.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  }

  /** Stop listening changes in the DOM */
  disconnect() {
    this.mutationObserver.disconnect();
  }

  /** the public API to be used in a React component */
  use = () => {
    React.useEffect(() => {
      this.observe();
      return this.disconnect;
    }, []);
  };

  private elementFromSelectors = (selectors: string[]) => {
    const elements = selectors.map((selector) =>
      document.querySelector<HTMLElement>(selector)
    );
    return elements;
  };

  private allElementsDefined = (
    elements: (HTMLElement | null)[]
  ): elements is HTMLElement[] => {
    return elements.every((element) => element !== null);
  };
}

export const domHandler = new EmbeddableSignupDOMHandler();
