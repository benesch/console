import { screen, waitFor } from "@testing-library/dom";

import { EmbeddableSignupDOMHandler } from "./dom";

const instance = () => new EmbeddableSignupDOMHandler();

const addHTML = (html: string) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  document.body.appendChild(div);
};

const resetHTML = () => {
  document.body.innerHTML = "";
};

afterEach(resetHTML);

describe("dom/EmbeddableSignupDOMHandler", () => {
  test("removeLoginLinkIfExist", () => {
    addHTML(`
        <div data-testid="login-link-parent">
          Click here to <a href="#" class="fe-sign-up__back-to-login-link">Login</a>
          </div>
    `);
    const dom = instance();
    dom.removeLoginLinkIfExist();
    expect(screen.queryByTestId("login-link-parent")?.style.display).toBe(
      "none"
    );
  });

  test("fixSignUpFormIfExist", () => {
    addHTML(`
        <div data-testid="login-link-parent">
          <input type="text" name="name" />
          
          <input type="text" name="email" />
          <input type="text" name="companyName" />
          <input type="submit" data-test-id="signupSubmit-btn" value="sign up" />
        </div>
    `);
    const dom = instance();
    dom.fixSignUpFormIfExist();
    const labels = document.querySelectorAll("label");
    expect(labels.length).toBe(3);
    expect((labels[0] as HTMLLabelElement).htmlFor).toBe("name");
    expect((labels[1] as HTMLLabelElement).htmlFor).toBe("email");
    expect((labels[2] as HTMLLabelElement).htmlFor).toBe("companyName");
  });

  test("sendSuccessEventIfSignupSuccessful", async () => {
    addHTML(
      ` <div class="fe-sign-up__success-container">Thanks for signing up</div>`
    );
    const dom = instance();
    const postMessage = jest.spyOn(window.parent, "postMessage");
    dom.sendSuccessEventIfSignupSuccessful();

    expect(postMessage).toHaveBeenCalledWith("EMBED_AUTH_SIGNUP_SUCCESS", "*");
  });

  test("observe should react on dom changes", async () => {
    const dom = instance();

    const spy = jest.spyOn(dom, "onDOMChange");
    dom.observe();

    document.body.insertAdjacentElement(
      "beforeend",
      document.createElement("div")
    );
    await waitFor(() => expect(spy).toHaveBeenCalled());
  });

  test("should stop observing the DOM if all routines have been executed successfully", async () => {
    const dom = instance();
    const onDOMChangeSpy = jest.spyOn(dom, "onDOMChange");
    const disconnect = jest.spyOn(dom, "disconnect");

    dom.observe();

    dom.state.formIsFixed = true;
    dom.state.loginLinkIsHidden = true;
    dom.state.signupSuccess = true;

    document.body.insertAdjacentElement(
      "beforeend",
      document.createElement("div")
    );

    await waitFor(() => expect(disconnect).toHaveBeenCalled());

    onDOMChangeSpy.mockReset();

    document.body.insertAdjacentElement(
      "beforeend",
      document.createElement("div")
    );
    expect(onDOMChangeSpy).not.toHaveBeenCalled();
  });
});
