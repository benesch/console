# Materialize web console

This is the web console interface for Materialize.

See [Architecture](/docs/architecture.md) for a general overview of how Console
talks to the rest of the Materialize.

## Running the app locally

Ensure you have node 18.x and yarn 1.x. The specific versions of these tools
are set for Volta in the package.json, if you have another preferred version
manager, please match those versions.

```bash
yarn install
yarn start
open http://localhost:3000
```

This will run Console locally, pointing at our staging cloud resources.

### Cloud setup

Clone the [Cloud repo](MaterializeInc/cloud) as a sibling to this repo. We rely
on cloud for a few things:

- The mzadmin tool for getting cli access to AWS and configuring our k8s
  contexts.
- Running our E2E tests against a cloud stack running in docker.
- The gen:api script uses cloud openapi specifications to generate our API
  clients.

See their [Developer
doc](https://github.com/MaterializeInc/cloud/blob/main/doc/developer.md) for
the most up to date instructions on working with the cloud repo.

Below is a quick start guide for our use of cloud.

Install the [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

Install some k8s utils:

```shell
brew install kubectl@1.24 k9s kind
```

Run the commands below to configure your aws account and k8s contexts

```shell
# Installs dependencies and configures your python venv
bin/rev-env
# Setup your aws config
bin/mzadmin aws setup
# Setup k8s contexts
bin/mzadmin k8s setup
```

### Running tests

Run the jest test with `yarn test:unit` or `yarn test:unit --watch`.

The playwright end-to-end tests require a cloud stack to run, generally using
Kind is simplest locally.

```shell
cd ../cloud
# Create and configure a k8s cluster
bin/kind-delete && bin/kind-create
# Run the controllers in the background
docker compose up environment-controller region-controller -d --wait
# Export the test user password
export E2E_TEST_PASSWORD=$(pulumi stack output --stack materialize/staging --show-secrets console_e2e_test_password)
cd ../console
yarn test:e2e
```

You only have to do this once per shell where you want to run tests, you can
now run the tests any time in that shell session. Setting `PWDEBUG=1` on the
test command will cause playwright to run in debug mode, where you can see the
test running live and step through the test code, as well as see a timeline of
the test after it's finished.

Tests save traces to the folder `test-results`, and you can use the following
playwright command to view these traces after the fact (also very useful for CI
failures).

```shell
yarn playwright show-trace test-results/platform-use-region-local-kind/trace-1.zip
```

### Deleting environments

There is no way to disable a region in the UI, so if you need to test the
enable region flow, you will need to delete the environment via the api.

From the cloud repo, run:

```bash
# Generate a temporary aws auth token
bin/mzadmin aws login
# Materialize employees can see their org ID in the footer of the console
bin/mzadmin environment delete --cluster staging-us-east-1 --organization $ID
```

## Theming

Materialize Console has light and dark mode support. Some of the styling
for this is implicit (based on Chakra's defaults). Other parts were customized
to match Materialize's styles and color scheme. When styling, make sure that
components look good in both modes. On Mac OS, you can toggle your color mode
with System Preferences \> General.

### Customizing

Chakra's theme docs live
[here](https://chakra-ui.com/docs/theming/customize-theme). There are two
methods by which we can customize our application's look and feel using Chakra:

#### App-wide styles and defaults in `src/theme/`

If your styling should apply to all instances of a built-in Chakra component,
across the board, it's best to modify the Chakra theme. Our custom color
palette is in `theme/colors.ts`, and imported and supplemented in
`theme/index.ts`. Customizations of reusable Chakra components live in
`theme/components.ts`, including setting default variant props. You can crib
off of the existing component styles there, and/or look up the
[sources for Chakra UI's default
theme](https://github.com/chakra-ui/chakra-ui/tree/main/packages/theme/src/components).
The Chakra docs for custom component theming, especially with dark mode in the
mix, are unfortunately not very thorough.

#### Component-specific styling with `useColorMode` and `useColorModeValue`

For one-off styles, especially to components that we built ourselves (that
aren't part of the Chakra system), you can use [Chakra's `useColorMode` and
`useColorModeValue` hooks](https://chakra-ui.com/docs/features/color-mode)
to swap between colors or other styles. `useColorModeValue` is preferred for
singular values (e.g. a single color)--if you need a whole long complicated
string or are switching many different variables, `useColorMode` might make
more sense.

It is preferred to not create a custom component wrapping a Chakra component to
add styles; this should happen in the aforementioned theme file instead.

### Theme testing

On Mac, you can set your color mode in `System Preferences > Settings`. When
you change your color mode, the site will dynamically switch styles. This makes
it pretty easy to check how your new feature works in either style.

## Images

Static images live in `img` and use imports to get added to their
parent component. For SVGs where one wants to customize attributes such as fill
colors, however, importing will not work; in that case the SVG should get added
to `src/svg` as a React component wherein that customization (for
light/dark mode, or for reuse) can happen.

## Code style

We use Prettier to format all files, enforced by eslint-plugin-prettier.
Configure your editor to format files on save and you generally won't have to
think much about formatting.

### Component files

At Materialize is acceptable to put multiple components in the same file, when
one is clearly consumed by another (and if, in your judgment, the file is not
too ungainly or complex).

There are exceptions, such as the various pieces of our `<Card>`s, where a
component must be in multiple "lego blocks" that fit together. When this happens
the file name should reflect the fact (e.g. `cardComponents.tsx` rather than
`Card.tsx`).

Don't name components index.tsx (other than the root of the application, of
course).

- This saves us from extraneous folders and
- This makes it easier to tell at a glance which component is which (if the
  title of every tab in your editor is index.tsx, that is really confusing!).

Name the props for your each component `$ComponentProps`, export it and put it
above the component that uses it.
