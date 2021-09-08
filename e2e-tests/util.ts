import { expect, Page } from "@playwright/test";
import extract from "extract-zip";
import fs from "fs";
import path from "path";
import { Client } from "pg";

export const CONSOLE_ADDR = process.env.CONSOLE_ADDR || "http://localhost:8000";

export const EMAIL = "infra+cloud-integration-tests@materialize.com";

// TODO(benesch): avoid hardcoding this password in the repository. There's
// nothing sensitive in the account, though, so the worst that could happen if
// leaked is that someone could spin up a bunch of deployments in this account.
export const PASSWORD = "4PbT*fgq2fLNkNLLq3vnqqvj";

export const LEGACY_VERSION = "v0.7.3";

/** Manages an end-to-end test against Materialize Cloud. */
export class TestContext {
  page: Page;
  accessToken: string;

  constructor(page: Page, accessToken: string) {
    this.page = page;
    this.accessToken = accessToken;
  }

  /** Start a new test. */
  static async start(page: Page) {
    // Squirrel away the access token for later.
    const [response] = await Promise.all([
      page.waitForResponse("**/identity/resources/auth/v1/user/token/refresh"),
      page.goto(CONSOLE_ADDR),
    ]);
    const accessToken = (await response.json())["accessToken"];
    const context = new TestContext(page, accessToken);

    // Update the refresh token for future tests.
    await page.context().storageState({ path: "state.json" });

    // Provide a clean slate for the test.
    context.deleteAllDeployments();
    await page.waitForSelector("text=No deployments yet");

    return context;
  }

  /**
   * Make an API request using the browser's access token.
   */
  async apiRequest(url: string, request?: RequestInit) {
    request = {
      ...request,
      headers: {
        authorization: `Bearer ${this.accessToken}`,
        "content-type": "application/json",
        ...(request || {}).headers,
      },
    };
    // TODO(benesch): upgrade to Playwright's native support for this when it is
    // released.
    // See: https://github.com/microsoft/playwright/issues/5999
    return this.page.evaluate(
      async ({ url, request }) => {
        const response = await fetch(url, request);
        if (response.status === 204) {
          return null;
        } else {
          return await response.json();
        }
      },
      { url: `${CONSOLE_ADDR}/api${url}`, request }
    );
  }

  /** Delete any existing deployments. */
  async deleteAllDeployments() {
    const deployments = await this.apiRequest("/deployments");
    for (const d of deployments) {
      await this.apiRequest(`/deployments/${d.id}`, { method: "DELETE" });
    }
  }

  /**
   * Attempt a pgwire connection to Materialize.
   *
   * Assumes that the browser is navigated to a deployment detail page.
   */
  async pgConnect() {
    // Determine hostname.
    const hostname = await this.readDeploymentField("hostname");

    // Download certificates.
    const [download] = await Promise.all([
      this.page.waitForEvent("download"),
      this.page.click("text=Download certificates"),
    ]);
    const certsZip = await download.path();
    await extract(certsZip, { dir: path.resolve("scratch") });

    // Attempt PostgreSQL connection to Materialize.
    const pgParams = {
      user: "materialize",
      host: hostname,
      port: 6875,
      database: "materialize",
      ssl: {
        ca: fs.readFileSync("scratch/ca.crt", "utf8"),
        key: fs.readFileSync("scratch/materialize.key", "utf8"),
        cert: fs.readFileSync("scratch/materialize.crt", "utf8"),
        rejectUnauthorized: false,
      },
      connectionTimeoutMillis: 1000,
      query_timeout: 1000,
    };
    for (let i = 0; i < 100; i++) {
      try {
        const client = new Client(pgParams);
        await client.connect();
        return client;
      } catch (error) {
        console.log(error);
        await this.page.waitForTimeout(500);
      }
    }
    throw new Error("unable to connect");
  }

  /** Read a deployment field from the deployment detail page. */
  async readDeploymentField(name: string) {
    const field = await this.page.waitForSelector(`text=${name}`);
    return await field.evaluate((e) => e.nextSibling.textContent);
  }

  /** Wait for a deployment to have reached the given version. */
  async waitForDeploymentVersion(version: string) {
    await this.page.waitForSelector(
      `css=[data-card-field-name="Version"] >> text=${version}`
    );
  }

  /**
   * Waits for a deployment to be healthy.
   *
   * Assumes that the browser is nativated to a deployment detail page.
   */
  async waitForDeploymentHealthy() {
    await this.page.waitForSelector("text=Healthy", {
      timeout: 180000 /* 3 minutes */,
    });
  }

  /**
   * Assert the expected version number of a Materialize deployment.
   *
   * Assumes that the browser is navigated to a deployment detail page.
   */
  async assertDeploymentMzVersion(expectedVersion: string) {
    // Check the version reported via pgwire.
    {
      const pgConn = await this.pgConnect();
      const result = await pgConn.query("SELECT mz_version()");
      await pgConn.end();
      let version: string = result.rows[0].mz_version;
      version = version.split(" ")[0];
      expect(version).toEqual(expectedVersion);
    }

    // Check the version reported on the page.
    {
      const version = await this.readDeploymentField("version");
      expect(version).toEqual(expectedVersion);
    }
  }

  /**
   * Assert the expected size of a Materialize deployment.
   *
   * Assumes that the browser is navigated to a deployment detail page.
   */
  async assertDeploymentSize(expectedSize: string) {
    const size = await this.readDeploymentField("size");
    expect(size).toEqual(expectedSize);
  }
}
