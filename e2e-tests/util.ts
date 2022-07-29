import { APIRequestContext, chromium, expect, Page } from "@playwright/test";
import CacheableLookup from "cacheable-lookup";
import extract from "extract-zip";
import fs from "fs";
import path from "path";
import { Client, ClientConfig } from "pg";

export const CONSOLE_ADDR = process.env.CONSOLE_ADDR || "http://localhost:8000";

export const IS_KIND =
  CONSOLE_ADDR === "http://localhost:8000" ||
  CONSOLE_ADDR === "http://backend:8000";

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

export const USER_ID = "40065de2-e723-4bda-a411-8cbc1d7f5c14";
export const TENANT_ID = "d376e19f-64bf-4d39-9268-5f7f1c3ddec4";

export const LEGACY_VERSION = "v0.20.0";

const adminPortalHost = () => {
  if (IS_KIND) {
    return "admin.staging.cloud.materialize.com";
  } else {
    const console_url = new URL(CONSOLE_ADDR);
    return `admin.${console_url.host}`;
  }
};

interface ContextWaitForSelectorOptions {
  /** Number of milliseconds to wait for the selector to appear. */
  timeout?: number;
}

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
    await context.deleteAllDeployments();
    await context.deleteAllEnvironmentAssignments();

    // Navigate to the home page.
    await page.goto(CONSOLE_ADDR);

    // Ensure they're on the deployments page, whether the test is for platform or not
    // TODO make start() not deployments-centric once we're in platform world
    await page.click('a:has-text("Deployments")');
    await page.waitForSelector("text=No deployments yet");

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
  async apiRequest(url: string, request?: any, baseUrl?: string) {
    await this.ensureAuthenticated();
    url = `${baseUrl || CONSOLE_ADDR}/api${url}`;
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

  /** Delete any existing deployments. */
  async deleteAllDeployments() {
    const deployments = await this.apiRequest("/deployments");
    for (const d of deployments) {
      console.log(`Deleting deployment ${d.id}`);
      try {
        await this.apiRequest(`/deployments/${d.id}`, { method: "DELETE" });
      } catch (e: unknown) {
        // if the deployment does not exist, it's okay to ignore the error.
        const deploymentDoesNotExist = e.message.includes("API Error 404");
        if (!deploymentDoesNotExist) {
          throw e;
        }
      }
    }
  }

  /** Delete any existing EnvironmentAssignments. */
  async deleteAllEnvironmentAssignments() {
    const providers = await this.apiRequest("/cloud-providers");

    for (const { regionControllerUrl } of providers) {
      console.log(`Deleting EnvironmentAssignment from ${regionControllerUrl}`);
      try {
        await this.apiRequest(
          `/environmentassignment`,
          { method: "DELETE" },
          regionControllerUrl
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
    return await this.fronteggRequest(
      `/identity/resources/users/api-tokens/v1`,
      {
        headers: {
          "frontegg-tenant-id": TENANT_ID,
          "frontegg-user-id": USER_ID,
        },
      }
    );
  }

  async deleteAllKeysOlderThan(hours: number) {
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
              "frontegg-tenant-id": TENANT_ID,
              "frontegg-user-id": USER_ID,
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

  /**
   * Attempt a pgwire connection to Materialize with mutual TLS authentication.
   *
   * Assumes that the browser is navigated to a deployment detail page.
   */
  async pgConnect() {
    // Determine hostname and port.
    const hostname = await this.readDeploymentField("Hostname");
    const port = await this.readDeploymentField("Port");

    // Download certificates.
    const [download] = await Promise.all([
      this.page.waitForEvent("download"),
      this.page.click("text=Download certificates"),
    ]);
    const certsZip = await download.path();
    await extract(certsZip, { dir: path.resolve("scratch") });

    const dns = new CacheableLookup({
      maxTtl: 0, // always re-lookup
      errorTtl: 0,
    });

    // Attempt PostgreSQL connection to Materialize.
    for (let i = 0; i < 5 * 60; i++) {
      try {
        const entry = hostname && (await dns.lookupAsync(hostname));
        const pgParams: ClientConfig = {
          user: "materialize",
          host: entry ? entry.address : undefined,
          port: Number(port) || undefined,
          database: "materialize",
          ssl: {
            ca: fs.readFileSync("scratch/ca.crt", "utf8"),
            key: fs.readFileSync("scratch/materialize.key", "utf8"),
            cert: fs.readFileSync("scratch/materialize.crt", "utf8"),
            rejectUnauthorized: false,
          },
          connectionTimeoutMillis: 10000,
          query_timeout: 10000,
        };
        const client = new Client(pgParams);
        await client.connect();
        return client;
      } catch (error) {
        console.log(error);
        await this.page.waitForTimeout(1000);
      }
    }
    throw new Error("unable to connect");
  }

  async pgConnectPassword(password: string) {
    // Determine hostname and port.
    const hostname = await this.readDeploymentField("Hostname");
    const port = await this.readDeploymentField("Port");
    const dns = new CacheableLookup({
      maxTtl: 0, // always re-lookup
      errorTtl: 0,
    });

    for (let i = 0; i < 60; i++) {
      try {
        const entry = hostname && (await dns.lookupAsync(hostname));
        const pgParams: ClientConfig = {
          user: EMAIL,
          host: entry ? entry.address : undefined,
          port: Number(port) || undefined,
          database: "materialize",
          password,
          ssl: IS_KIND ? undefined : { rejectUnauthorized: false },
          connectionTimeoutMillis: 10000,
          query_timeout: 10000,
        };
        const client = new Client(pgParams);
        await client.connect();
        return client;
      } catch (error: any) {
        console.log(error);
        if (error.code === "28P01") {
          console.log("app-specific passwords", await this.listAllKeys());
          throw new Error("wrong password");
        }
        await this.page.waitForTimeout(1000);
      }
    }
    throw new Error("unable to connect");
  }

  /** Read a deployment field from the deployment detail page. */
  async readDeploymentField(name: string) {
    const field = await this.page.waitForSelector(
      `css=[data-field-name="${name}"] >> text=${name}`
    );
    return await field.evaluate(
      (e) => e.nextSibling && e.nextSibling.textContent
    );
  }

  /** Wait until a deployment details field has the given value. */
  async waitForDeploymentFieldValue(
    name: string,
    value: string,
    options?: ContextWaitForSelectorOptions
  ) {
    await this.page.waitForSelector(
      `css=[data-field-name="${name}"] >> text=${value}`,
      options
    );
  }

  /** Wait for a deployment to have reached the given version. */
  async waitForDeploymentVersion(
    version: string,
    options?: ContextWaitForSelectorOptions
  ) {
    await this.waitForDeploymentFieldValue("Version", version, options);
  }

  /**
   * Waits for a deployment to be healthy.
   *
   * Assumes that the browser is nativated to a deployment detail page.
   */
  async waitForDeploymentHealthy() {
    await this.waitForDeploymentFieldValue("Status", "Healthy", {
      timeout: 600000 /* 10 minutes */,
    });
  }

  /**
   * Connects to postgres, runs your function, and cleans up the connection.
   */
  async withPostgres(f: (pgConn: Client) => Promise<any>) {
    const pgConn = await this.pgConnect();
    const result = await f(pgConn);
    await pgConn.end();
    return result;
  }

  /**
   * Assert the expected version number of a Materialize deployment.
   *
   * Assumes that the browser is navigated to a deployment detail page.
   */
  async assertDeploymentMzVersion(expectedVersion: string, password?: string) {
    // Check the version reported via pgwire.
    {
      const pgConn = password
        ? await this.pgConnectPassword(password)
        : await this.pgConnect();
      const result = await pgConn.query("SELECT mz_version()");
      await pgConn.end();
      let version: string = result.rows[0].mz_version;
      version = version.split(" ")[0];
      expect(version).toEqual(expectedVersion);
    }

    // Check the version reported on the page.
    {
      const version = await this.readDeploymentField("Version");
      expect(version).toEqual(expectedVersion);
    }
  }

  /**
   * Assert the expected size of a Materialize deployment.
   *
   * Assumes that the browser is navigated to a deployment detail page.
   */
  async assertDeploymentSize(expectedSize: string) {
    const size = await this.readDeploymentField("Size");
    expect(size).toEqual(expectedSize);
  }
}
