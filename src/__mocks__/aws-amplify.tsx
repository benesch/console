import { CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";

export class Auth {
  static configure(): any {
    return;
  }

  static currentAuthenticatedUser(): Promise<CognitoUser | any> {
    // Not logged in
    return Promise.reject();
  }

  static signIn(email: string, password: string): Promise<CognitoUser | any> {
    // Not logged in
    if (email === "unconfirmed") {
      return Promise.reject({
        code: "UserNotConfirmedException",
        name: "UserNotConfirmedException",
        message: "User is not confirmed.",
      });
    }
    if (password === "correct") {
      const pool = new CognitoUserPool({
        UserPoolId: "us-east-2_GbM7D8ZVg",
        ClientId: "7st072o8h1lhfj66mjf9vbcauo",
      });
      return Promise.resolve(
        new CognitoUser({ Username: "email", Pool: pool })
      );
    }
    return Promise.reject({
      code: "NotAuthorizedException",
      name: "NotAuthorizedException",
      message: "Incorrect username or password.",
    });
  }

  static signOut(): Promise<any> {
    return Promise.resolve({});
  }

  static signUp(email: string, password: string): Promise<CognitoUser | any> {
    // Not logged in
    if (email === "existing") {
      return Promise.reject({
        code: "UsernameExistsException",
        name: "UsernameExistsException",
        message: "An account with the given email already exists.",
      });
    }
    return Promise.resolve({
      codeDeliveryDetails: {
        AttributeName: "email",
        DeliveryMedium: "EMAIL",
        Destination: "b***@m***.io",
      },
      userConfirmed: false,
      userSub: "11111111-1111-1111-1111-111111111111",
    });
  }

  static confirmSignUp(
    email: string,
    code: string
  ): Promise<CognitoUser | any> {
    if (code === "mismatch") {
      return Promise.reject({
        code: "CodeMismatchException",
        name: "CodeMismatchException",
        message: "Invalid verification code provided, please try again.",
      });
    }
    return Promise.resolve({});
  }
}
