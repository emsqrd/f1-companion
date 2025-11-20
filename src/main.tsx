import { SignInForm } from '@/components/auth/SignInForm/SignInForm.tsx';
import { SignUpForm } from '@/components/auth/SignUpForm/SignUpForm.tsx';
import { Toaster } from '@/components/ui/sonner';
import * as Sentry from '@sentry/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';

import { Account } from './components/Account/Account.tsx';
import { CreateTeam } from './components/CreateTeam/CreateTeam.tsx';
import { LandingPage } from './components/LandingPage/LandingPage.tsx';
import { Layout } from './components/Layout/Layout.tsx';
import { League } from './components/League/League.tsx';
import { LeagueList } from './components/LeagueList/LeagueList.tsx';
import { NoTeamGuard } from './components/NoTeamGuard/NoTeamGuard.tsx';
import { Team } from './components/Team/Team.tsx';
import { TeamRequiredGuard } from './components/TeamRequiredGuard/TeamRequiredGuard.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { TeamProvider } from './contexts/TeamContext.tsx';
import './index.css';
import { withProtection } from './utils/routeHelpers.tsx';

// Initialize Sentry for error tracking and performance monitoring
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Performance Monitoring
  tracesSampleRate: import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE
    ? parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE)
    : 0.1, // Default: 10% (override with VITE_SENTRY_TRACES_SAMPLE_RATE env var)

  // Set tracePropagationTargets to control distributed tracing between frontend and backend
  tracePropagationTargets: ['localhost', import.meta.env.VITE_F1_FANTASY_API].filter(Boolean),

  // Session Replay
  replaysSessionSampleRate: import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE
    ? parseFloat(import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE)
    : 0.1,

  environment: import.meta.env.MODE,

  // Only enable in production or when DSN is configured
  enabled: !!import.meta.env.VITE_SENTRY_DSN,

  enableLogs: true,
});

const ProtectedLeagueList = withProtection(LeagueList);
const ProtectedLeague = withProtection(League);
const ProtectedTeam = withProtection(Team);
const ProtectedAccount = withProtection(Account);
const ProtectedCreateTeam = withProtection(CreateTeam);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster position="top-center" />
    <AuthProvider>
      <TeamProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public routes */}
              <Route index element={<LandingPage />} />
              <Route path="/sign-in" element={<SignInForm />} />
              <Route path="/sign-up" element={<SignUpForm />} />

              {/* Protected route - account (no team required) */}
              <Route path="/account" element={<ProtectedAccount />} />

              {/* Protected route - view any team */}
              <Route path="/team/:teamId" element={<ProtectedTeam />} />

              {/* Protected route - only accessible to users without a team */}
              <Route element={<NoTeamGuard />}>
                <Route path="/create-team" element={<ProtectedCreateTeam />} />
              </Route>

              {/* Protected routes - team required */}
              <Route element={<TeamRequiredGuard />}>
                <Route path="/leagues" element={<ProtectedLeagueList />} />
                <Route path="/league/:leagueId" element={<ProtectedLeague />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </TeamProvider>
    </AuthProvider>
  </StrictMode>,
);
