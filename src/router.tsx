/**
 * @module
 * URL routing.
 */

import { useAuth as useFronteggAuth } from "@frontegg/react";
import { useFlags, useLDClient } from "launchdarkly-react-client-sdk";
import React from "react";
import {
  Navigate,
  Route,
  Routes,
  RoutesProps,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useRecoilState_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import AppPasswordsPage from "~/access/AppPasswordsPage";
import CLI from "~/access/cli";
import PricingPage from "~/access/PricingPage";
import AnalyticsOnEveryPage from "~/analytics/AnalyticsOnEveryPage";
import { hasInvoiceReadPermission, useAuth } from "~/api/auth";
import { AuthProvider } from "~/api/auth";
import { BaseLayout } from "~/layouts/BaseLayout";
import LoadingScreen from "~/loading";
import BillingPage from "~/platform/billing/BillingPage";
import ClusterRoutes from "~/platform/clusters/ClusterRoutes";
import Home from "~/platform/home/Home";
import SecretsList from "~/platform/secrets/SecretsList";
import SinkRoutes from "~/platform/sinks/SinkRoutes";
import SourceRoutes from "~/platform/sources/SourceRoutes";
import { SentryRoutes } from "~/sentry";
import { assert } from "~/util";

import ConnectionsRoutes from "./platform/connections/ConnectionsRoutes";
import {
  currentEnvironmentIdState,
  defaultRegion,
  useEnvironmentsWithHealth,
} from "./recoil/environments";
import { useTrackFocus } from "./recoil/focus";
import { regionIdToSlug, regionSlugToNameMap, useRegionSlug } from "./region";

const Editor = React.lazy(() => import("~/platform/editor/Editor"));

/** The root router for the application. */
const Router = () => {
  useTrackFocus();

  const ldClient = useLDClient();
  const { user } = useFronteggAuth();

  React.useEffect(() => {
    if (!ldClient || !user) return;

    ldClient.identify({
      kind: "multi",
      user: {
        key: user.id,
        email: user.email,
        custom: {
          orgId: user.tenantId,
        },
      },
      organization: {
        key: user.tenantId,
      },
    });
  }, [ldClient, user]);

  return (
    <>
      <ProtectedRoutes>
        <Route
          path="/showSourceCredentials"
          element={<RedirectToEnvironment />}
        />
        <Route path="/regions/:regionSlug/*" element={<EnvironmentRoutes />} />
        <Route
          path="/access/cli"
          element={
            <BaseLayout>
              <CLI />
            </BaseLayout>
          }
        />
        <Route
          path="/access"
          element={
            <BaseLayout>
              <AppPasswordsPage />
            </BaseLayout>
          }
        />
        <Route
          path="/pricing"
          element={
            <BaseLayout>
              <PricingPage />
            </BaseLayout>
          }
        />
        <Route
          path="/editor"
          element={
            <BaseLayout overflowY="hidden">
              <Editor />
            </BaseLayout>
          }
        />
        {user && hasInvoiceReadPermission(user) && (
          <Route
            path="/billing"
            element={
              <BaseLayout>
                <BillingPage />
              </BaseLayout>
            }
          />
        )}
        <Route path="*" element={<RedirectToHome />} />
      </ProtectedRoutes>
      <AnalyticsOnEveryPage />
    </>
  );
};

type RegionParams = "regionSlug";

const RedirectToEnvironment = () => {
  return (
    <Navigate
      to={`/regions/${regionIdToSlug(
        defaultRegion()
      )}/connect/showSourceCredentials`}
    />
  );
};

const EnvironmentRoutes = () => {
  const { user } = useAuth();
  const params = useParams<RegionParams>();
  const navigate = useNavigate();
  const [currentEnvironmentId, setCurrentEnvironmentId] =
    useRecoilState_TRANSITION_SUPPORT_UNSTABLE(currentEnvironmentIdState);
  const environments = useEnvironmentsWithHealth(user.accessToken);
  assert(params.regionSlug);
  const regionId = regionSlugToNameMap.get(params.regionSlug);
  const flags = useFlags();

  React.useEffect(() => {
    if (!regionId) {
      navigate(`/regions/${regionIdToSlug(defaultRegion())}`);
      return;
    }

    if (currentEnvironmentId !== regionId) {
      // Syncronize the url with recoil, this happens on navigation to a link to another cluster or back navigation
      setCurrentEnvironmentId(regionId);
    }
    // Redirect to the connect page if a region is not enabled
    if (environments.get(regionId)?.state !== "enabled") {
      navigate(`/regions/${params.regionSlug}/connect`, { replace: true });
    }
  }, [
    currentEnvironmentId,
    environments,
    navigate,
    params.regionSlug,
    regionId,
    setCurrentEnvironmentId,
  ]);

  if (!regionId) {
    return null;
  }
  return (
    <Routes>
      <Route
        path="/connect/*"
        element={
          <BaseLayout>
            <Home />
          </BaseLayout>
        }
      />
      <Route
        path="/clusters/*"
        element={
          <BaseLayout>
            <ClusterRoutes />
          </BaseLayout>
        }
      />
      <Route
        path="/sources/*"
        element={
          <BaseLayout>
            <SourceRoutes />
          </BaseLayout>
        }
      />
      <Route
        path="/sinks/*"
        element={
          <BaseLayout>
            <SinkRoutes />
          </BaseLayout>
        }
      />
      {flags["source-creation-41"] && (
        <>
          <Route
            path="/secrets"
            element={
              <BaseLayout>
                <SecretsList />
              </BaseLayout>
            }
          />
          <Route
            path="/connections/*"
            element={
              <BaseLayout>
                <ConnectionsRoutes />
              </BaseLayout>
            }
          />
        </>
      )}

      <Route
        path="/*"
        element={
          <Navigate to={`/regions/${params.regionSlug}/connect`} replace />
        }
      />
    </Routes>
  );
};

const RedirectToHome = () => {
  const location = useLocation();
  const { routes: authRoutes } = useFronteggAuth((state) => state);
  const regionSlug = useRegionSlug();
  if (
    location.pathname !== authRoutes.authenticatedUrl &&
    Object.values(authRoutes).includes(location.pathname)
  ) {
    // If this is an authentication route, it's Frontegg's responsibility to
    // handle it. Return null rather than redirecting so Frontegg has time to
    // notice it.
    return null;
  } else {
    return <Navigate to={`/regions/${regionSlug}/connect`} replace />;
  }
};

const ProtectedRoutes = (props: RoutesProps) => {
  const location = useLocation();
  // Consume Frontegg authentication state.
  const {
    isAuthenticated,
    isLoading,
    routes: authRoutes,
    user,
  } = useFronteggAuth((state) => state);

  // Wait for authentication state to load before determining what to do.
  if (isLoading) {
    return null;
  }

  if (location.pathname.startsWith("/account")) {
    // Paths that start with /account are handled by Frontegg, but for reasons
    // that are not fully understood, our router is rendered before Frontegg's.
    // Return `null` so that we don't issue a redirect before Frontegg's router
    // kicks in. This prevents redirect loops on sign in (#3413) and broken
    // logouts (#4351).
    return null;
  }

  // If unauthenticated, redirect to login page, remembering what page the user
  // was trying to access.
  if (!isAuthenticated) {
    const fullPath = location.pathname + location.search + location.hash;
    const redirectUrl = encodeURIComponent(fullPath);
    const loginUrl = `${authRoutes.loginUrl}?redirectUrl=${redirectUrl}`;
    return <Navigate to={loginUrl} replace />;
  }

  // If we're here, `isLoading` is `false` and `isAuthenticated` is true, which
  // guarantees that `user` is non-null. TypeScript can't infer this, so help it
  // along.
  assert(user);

  // Render the Routes.
  return (
    <AuthProvider user={user}>
      <React.Suspense fallback={<LoadingScreen />}>
        <SentryRoutes {...props} />
      </React.Suspense>
    </AuthProvider>
  );
};

export default Router;
