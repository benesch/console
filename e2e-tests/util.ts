import { APIRequestContext, expect, Page } from "@playwright/test";
import extract from "extract-zip";
import fs from "fs";
import path from "path";
import { Client, ClientConfig } from "pg";

import { sleep } from "../frontend/src/util";

export const CONSOLE_ADDR = process.env.CONSOLE_ADDR || "http://localhost:8000";

export const IS_KIND =
  CONSOLE_ADDR === "http://localhost:8000" ||
  CONSOLE_ADDR === "http://backend:8000";

export const EMAIL = "infra+cloud-integration-tests@materialize.com";

export const USER_ID = "40065de2-e723-4bda-a411-8cbc1d7f5c14";
export const TENANT_ID = "d376e19f-64bf-4d39-9268-5f7f1c3ddec4";

// TODO(benesch): avoid hardcoding this password in the repository. There's
// nothing sensitive in the account, though, so the worst that could happen if
// leaked is that someone could spin up a bunch of deployments in this account.
export const PASSWORD = "4PbT*fgq2fLNkNLLq3vnqqvj";

export const LEGACY_VERSION = "v0.20.0";

export const STATE_NAME = "state.json";

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

  constructor(
    page: Page,
    request: APIRequestContext,
    auth: FronteggAuthResponse
  ) {
    this.page = page;
    this.request = request;
    this.accessToken = auth.accessToken;
    this.refreshToken = auth.refreshToken;
    this.refreshDeadline = TestContext.calculateRefreshDeadline(auth.expiresIn);
  }

  /** Start a new test. */
  static async start(page: Page, request: APIRequestContext) {
    const [auth] = await Promise.all([
      TestContext.authenticate(request),
      page.goto(CONSOLE_ADDR),
    ]);

    const context = new TestContext(page, request, auth);

    // Provide a clean slate for the test.
    await context.deleteAllDeployments();
    await context.deleteAllPlatformDeploymentsAndExitModal(page);

    // Ensure they're on the deployments page, whether the test is for platform or not
    // TODO make start() not deployments-centric once we're in platform world
    await page.click('a:has-text("Deployments")');
    await page.waitForSelector("text=No deployments yet");

    return context;
  }

  static async authenticate(request: APIRequestContext) {
    const authUrl = `https://${adminPortalHost()}/identity/resources/auth/v1/user`;
    const response = await request.post(authUrl, {
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
    return auth;
  }

  static calculateRefreshDeadline(expiresIn: number) {
    // Use the expiresIn instead of expires, since expires is a hard to work with string.
    const expires = new Date();
    expires.setUTCSeconds(expires.getUTCSeconds() + expiresIn / 2);
    return expires;
  }

  /**
   * Make a Frontegg API request using the browser's access token.
   */
  async fronteggRequest(url: string, request?: any) {
    if (new Date().getTime() < this.refreshDeadline.getTime()) {
      const auth = await TestContext.authenticate(this.request);
      this.accessToken = auth.accessToken;
      this.refreshToken = auth.refreshToken;
      this.refreshDeadline = TestContext.calculateRefreshDeadline(
        auth.expiresIn
      );
    }
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
   * Make an API request using the browser's access token.
   */
  async apiRequest(url: string, request?: any, alt_addr?: string) {
    if (new Date().getTime() < this.refreshDeadline.getTime()) {
      const auth = await TestContext.authenticate(this.request);
      this.accessToken = auth.accessToken;
      this.refreshToken = auth.refreshToken;
      this.refreshDeadline = TestContext.calculateRefreshDeadline(
        auth.expiresIn
      );
    }
    url = `${alt_addr || CONSOLE_ADDR}/api${url}`;
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

  /** Delete any platform deployment. */
  async deleteAllPlatformDeploymentsAndExitModal(page: Page) {
    let modalIsAvailable = false;
    try {
      await page.locator('[aria-label="Close"]').waitFor({ timeout: 10000 });
      modalIsAvailable = true;
    } catch {
      console.log("No modal.");
    } finally {
      // If no modal is available it means that there are platform deployments
      if (modalIsAvailable === false) {
        await page
          .locator('select[aria-label="Environment"]')
          .waitFor({ timeout: 10000 });

        await page.selectOption('select[aria-label="Environment"]', {
          label: "+ Edit Regions",
        });
        console.log("Editing regions");
        await page.waitForSelector("table tbody tr");
        const regionRows = page.locator("table tbody tr");
        const regionsNames = [];

        for (let i = 0; i < (await regionRows.count()); i++) {
          const row = regionRows.nth(i);
          const fields = row.locator("td");
          const regionName = await row.locator("td").first().innerText();
          regionsNames.push(regionName);

          await sleep(1000);

          row.locator('button:text("Destroy")').waitFor();

          const buttonLabel = await fields.nth(3).innerText();

          if (buttonLabel.startsWith("Destroy")) {
            await row.locator('button:text("Destroy")').click();
            const modal = await page.locator(".chakra-portal").nth(1);
            await modal.locator("input").type(regionName);
            await modal.locator("button:text('Destroy')").click();
            await modal.waitFor({ state: "detached" });
          }
        }
      }

      await this.exitModal(page);
    }
  }

  /** Delete any existing deployments. */
  async deleteAllEnvironments() {
    const providersEnvrionments = await this.apiRequest("/cloud-providers");

    for (const { environmentControllerUrl } of providersEnvrionments) {
      try {
        await this.apiRequest(
          `/environment`,
          { method: "DELETE" },
          environmentControllerUrl
        );
      } catch (e: unknown) {
        console.error(e);
        // if the deployment does not exist, it's okay to ignore the error.
        const deploymentDoesNotExist = e.message.includes("API Error 404");
        if (!deploymentDoesNotExist) {
          throw e;
        }
      }
    }

    // Give time to the environment controller to turn off the environments
    if (providersEnvrionments.length > 0) {
      sleep(10000);
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

    // Attempt PostgreSQL connection to Materialize.
    const pgParams: ClientConfig = {
      user: "materialize",
      host: hostname || undefined,
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
    for (let i = 0; i < 60; i++) {
      try {
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

    // Attempt PostgreSQL connection to Materialize.
    const pgParams: ClientConfig = {
      user: EMAIL,
      host: hostname || undefined,
      port: Number(port) || undefined,
      database: "materialize",
      password,
      ssl: IS_KIND ? undefined : { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      query_timeout: 10000,
    };
    for (let i = 0; i < 60; i++) {
      try {
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

  /**
   * Exits the welcome modal
   * @param page
   */
  async exitModal(page: Page) {
    await page.click('[aria-label="Close"]', { force: true });
  }

  /**
   * Exits the welcome modal
   * @param page
   */
  async exitModalAndEnterRegions(page: Page) {
    await page.click('[aria-label="Close"]', { force: true });
    console.log("Closing");
    await page.click("+ Enable Regions");
  }
}
