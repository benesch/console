import { APIRequestContext, Page } from "@playwright/test";

export const CONSOLE_ADDR = process.env.CONSOLE_ADDR || "http://localhost:3000";

export const CONSOLE_URL = new URL(CONSOLE_ADDR);

export const IS_KIND =
  CONSOLE_ADDR === "http://localhost:3000" ||
  CONSOLE_ADDR === "http://frontend:3000";

export const PLATFORM_REGIONS = IS_KIND
  ? ["local/kind"]
  : ["AWS/us-east-1", "AWS/eu-west-1"];

export const PULUMI_STACK = (() => {
  const url = new URL(CONSOLE_ADDR);
  if (IS_KIND) {
    return "staging";
  } else {
    const hostnameRe = /^([^.]+)?\.?(staging)?\.?cloud.materialize.com$/;
    const matches = url.hostname.match(hostnameRe);
    return !matches ? "staging" : matches[1] || matches[2] || "production";
  }
})();

export const PASSWORD = (() => {
  if (!process.env.E2E_TEST_PASSWORD) {
    throw new Error(
      `Please set $E2E_TEST_PASSWORD on the environment; use 'pulumi stack output --stack materialize/${PULUMI_STACK} --show-secrets e2e_test_user_password' to retrieve the value.`
    );
  }
  return process.env.E2E_TEST_PASSWORD;
})();

export const EMAIL = `infra+cloud-integration-tests-${PULUMI_STACK}-${process.env.TEST_PARALLEL_INDEX}@materialize.com`;

export const STATE_NAME = `state-${process.env.TEST_PARALLEL_INDEX}.json`;

export const ensureLoggedIn = async (page: Page) => {
  // Wait up to two minutes for the page to become available initially, as
  // Webpack can take a while to compile in CI.
  await page.goto(CONSOLE_ADDR, { timeout: 1000 * 60 * 2 });
  await page.type("[name=email]", EMAIL);
  await page.press("[name=email]", "Enter");
  await page.waitForSelector("[name=password]"); // wait for animation
  await page.type("[name=password]", PASSWORD);
  await Promise.all([
    page.waitForNavigation(),
    page.press("[name=password]", "Enter"),
  ]);
  await page.context().storageState({ path: STATE_NAME });
};

export const LEGACY_VERSION = "v0.26.0";

const adminPortalHost = () => {
  if (IS_KIND) {
    return "admin.staging.cloud.materialize.com";
  } else {
    return `admin.${CONSOLE_URL.host}`;
  }
};

const getRegionControllerUrl = (region: string) => {
  if (IS_KIND) {
    return "http://localhost:8002";
  } else {
    const [provider, cloudRegion] = region.toLowerCase().split("/");
    return `https://rc.${cloudRegion}.${provider}.${CONSOLE_URL.host}`;
  }
};

interface FronteggAuthResponse {
  /** Short-lived access token. */
  accessToken: string;
  /** Longer-lived refresh token, usable only once. */
  refreshToken: string;
  /** Time after which the access token has expired. */
  expires: string;
  /** Seconds until expiration */
  expiresIn: number;
}

/** Manages an end-to-end test against Materialize Cloud. */
export class TestContext {
  page: Page;
  request: APIRequestContext;
  accessToken: string;
  refreshToken: string;
  refreshDeadline: Date;

  constructor(page: Page, request: APIRequestContext) {
    this.page = page;
    this.request = request;
    this.accessToken = "";
    this.refreshToken = "";
    this.refreshDeadline = new Date(0);
  }

  /** Start a new test. */
  static async start(page: Page, request: APIRequestContext) {
    const context = new TestContext(page, request);

    await ensureLoggedIn(page);
    // Provide a clean slate for the test.
    await context.deleteAllEnvironmentAssignments();

    // Navigate to the home page && wait for that to load.
    await page.goto(CONSOLE_ADDR);
    await page.waitForSelector('text="Welcome to Materialize!"');

    return context;
  }

  async ensureAuthenticated() {
    if (new Date().getTime() < this.refreshDeadline.getTime()) {
      return;
    }

    const authUrl = `https://${adminPortalHost()}/identity/resources/auth/v1/user`;
    const response = await this.request.post(authUrl, {
      data: {
        email: EMAIL,
        password: PASSWORD,
      },

      // frontegg's upstream timeout is 60s, they advise us to run
      // for longer than that so that they can see why our requests
      // are occasionally timing out.
      //
      // TODO: figure out why we see occasional timeouts and remove this.
      timeout: 61 * 1000,
    });

    const text = await response.text();
    let auth: FronteggAuthResponse;
    try {
      auth = JSON.parse(text);
    } catch (e: unknown) {
      console.error(`Invalid json from ${authUrl}:\n${text}`);
      throw e as SyntaxError;
    }

    this.accessToken = auth.accessToken;
    this.refreshToken = auth.refreshToken;
    // Use the expiresIn instead of expires, since expires is a hard to work
    // with string.
    this.refreshDeadline = new Date();
    this.refreshDeadline.setUTCSeconds(
      this.refreshDeadline.getUTCSeconds() + auth.expiresIn / 2
    );
  }

  /**
   * Make an authenticated Frontegg API request.
   */
  async fronteggRequest(url: string, request?: any) {
    await this.ensureAuthenticated();
    url = `https://${adminPortalHost()}${url}`;
    request = {
      ...request,
      headers: {
        authorization: `Bearer ${this.accessToken}`,
        "content-type": "application/json",
        ...(request || {}).headers,
      },
    };
    const response = await this.request.fetch(url, request);

    // rethrowing the error here if the response is not ok.
    // we also try to attach useful req/res info to the error.
    // this should be extracted to a helper function, but the evaluate method cannot access a variable out of scope.
    let responsePayload = undefined;
    try {
      responsePayload = await response.text();
    } finally {
      if (!response.ok)
        // eslint-disable-next-line no-unsafe-finally
        throw new Error(
          `Frontegg API Error ${response.status}  ${url}, req: ${
            request.body ?? "No request body"
          }, res: ${responsePayload ?? "No response body"}`
        );
    }

    if (response.status() === 204) {
      return null;
    } else if (request.method !== "DELETE") {
      // we already consume the body as text, so we need to parse manually
      return JSON.parse(responsePayload);
    }
  }

  /**
   * Make an authenticated API request.
   */
  async apiRequest(url: string, request?: any) {
    await this.ensureAuthenticated();
    request = {
      ...request,
      headers: {
        authorization: `Bearer ${this.accessToken}`,
        "content-type": "application/json",
        ...(request || {}).headers,
      },
    };
    const response = await this.request.fetch(url, request);

    // rethrowing the error here if the response is not ok.
    // we also try to attach useful req/res info to the error.
    // this should be extracted to a helper function, but the evaluate method cannot access a variable out of scope.
    let responsePayload = undefined;
    try {
      responsePayload = await response.text();
    } finally {
      if (!response.ok())
        // eslint-disable-next-line no-unsafe-finally
        throw new Error(
          `API Error ${response.status()}  ${url}, req: ${
            request.body ?? "No request body"
          }, res: ${responsePayload ?? "No response body"}`
        );
    }

    if (response.status() === 204 || response.status() === 202) {
      return null;
    } else {
      // we already consume the body as text, so we need to parse manually
      return JSON.parse(responsePayload);
    }
  }

  /** Delete any existing EnvironmentAssignments. */
  async deleteAllEnvironmentAssignments() {
    for (const region of PLATFORM_REGIONS) {
      const regionControllerUrl = getRegionControllerUrl(region);
      console.log(
        `Deleting EnvironmentAssignment from ${regionControllerUrl}, this may take up to 5min...`
      );
      try {
        await this.apiRequest(
          `${regionControllerUrl}/api/environmentassignment`,
          { method: "DELETE", timeout: 5 * 60000 }
        );
      } catch (e: unknown) {
        console.error(e);
        // If the environment does not exist, it's okay to ignore the error.
        if (e.message.includes("API Error 404")) {
          console.log("EnvironmentAssignment already deleted.");
        } else {
          throw e;
        }
      }
    }
  }

  async listAllKeys() {
    const { id, tenantId } = await this.fronteggRequest(
      `/identity/resources/users/v2/me`
    );

    return await this.fronteggRequest(
      `/identity/resources/users/api-tokens/v1`,
      {
        headers: {
          "frontegg-tenant-id": tenantId,
          "frontegg-user-id": id,
        },
      }
    );
  }

  async deleteAllKeysOlderThan(hours: number) {
    const { id, tenantId } = await this.fronteggRequest(
      `/identity/resources/users/v2/me`
    );
    const userKeys = await this.listAllKeys();
    for (const k of userKeys) {
      const age = new Date() - Date.parse(k.createdAt);
      if (age < hours * 60 * 60 * 1000) {
        continue;
      }
      try {
        await this.fronteggRequest(
          `/identity/resources/users/api-tokens/v1/${k.clientId}`,
          {
            method: "DELETE",
            headers: {
              "frontegg-tenant-id": tenantId,
              "frontegg-user-id": id,
            },
          }
        );
      } catch (e: unknown) {
        // if the deployment does not exist, it's okay to ignore the error.
        const keyDoesNotExist = e.message.includes("API Error 404");
        if (!keyDoesNotExist) {
          throw e;
        }
      }
    }
  }
}
