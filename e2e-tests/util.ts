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

export const LEGACY_VERSION = "v0.9.1";

interface ContextWaitForSelectorOptions {
  /** Number of milliseconds to wait for the selector to appear. */
  timeout?: number;
}

/** A custom error that embeds information about the api response */
export class ApiError extends Error {
  constructor(public response: Response, message: string) {
    super(message);
  }
}

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
    const refreshTokenUrl = "**/identity/resources/auth/v1/user/token/refresh";
    // Squirrel away the access token for later.
    const [response] = await Promise.all([
      page.waitForResponse(refreshTokenUrl),
      page.goto(CONSOLE_ADDR),
    ]);
    const text = await response.text();
    let accessToken;
    try {
      accessToken = JSON.parse(text)["accessToken"];
    } catch (e: unknown) {
      console.error(`Invalid json from ${refreshTokenUrl}:\n${text}`);
      throw e as SyntaxError;
    }
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

        // rethrowing the error here if the response is not ok.
        // we also try to attach useful req/res info to the error.
        // this should be extracted to a helper function, but the evaluate method cannot access a variable out of scope.
        let responsePayload = undefined;
        try {
          responsePayload = await response.text();
        } finally {
          if (!response.ok)
            // eslint-disable-next-line no-unsafe-finally
            throw new ApiError(
              response,
              `API Error ${response.status}  ${url}, req: ${
                request.body ?? "No request body"
              }, res: ${responsePayload ?? "No response body"}`
            );
        }

        if (response.status === 204) {
          return null;
        } else {
          // we already consume the body as text, so we need to parse manually
          return JSON.parse(responsePayload);
        }
      },
      { url: `${CONSOLE_ADDR}/api${url}`, request }
    );
  }

  /** Delete any existing deployments. */
  async deleteAllDeployments() {
    const deployments = await this.apiRequest("/deployments");
    for (const d of deployments) {
      try {
        await this.apiRequest(`/deployments/${d.id}`, { method: "DELETE" });
      } catch (e: unknown) {
        // if the deployment does not exist, it's okay to ignore the error.
        const deploymentDoesNotExist =
          e instanceof ApiError && e.response.status === 404;
        if (!deploymentDoesNotExist) {
          throw e;
        }
      }
    }
  }

  /**
   * Attempt a pgwire connection to Materialize.
   *
   * Assumes that the browser is navigated to a deployment detail page.
   */
  async pgConnect() {
    // Determine hostname.
    const hostname = await this.readDeploymentField("Hostname");

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
    for (let i = 0; i < 600; i++) {
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

  /** Read a deployment field from the deployment detail page. */
  async readDeploymentField(name: string) {
    const field = await this.page.waitForSelector(
      `css=[data-field-name="${name}"] >> text=${name}`
    );
    return await field.evaluate((e) => e.nextSibling.textContent);
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
