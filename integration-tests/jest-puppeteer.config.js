module.exports = {
  launch: {
    args: (process.env.PUPPETEER_BROWSER_ARGS || "").split(/\s+/),
    headless: process.env.PUPPETEER_HEADLESS !== "false",
  },
};
