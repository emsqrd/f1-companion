import { SignInForm } from '@/components/auth/SignInForm/SignInForm.tsx';
import { SignUpForm } from '@/components/auth/SignUpForm/SignUpForm.tsx';
import { Toaster } from '@/components/ui/sonner';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';

import { Account } from './components/Account/Account.tsx';
import { LandingPage } from './components/LandingPage/LandingPage.tsx';
import { Layout } from './components/Layout/Layout.tsx';
import { League } from './components/League/League.tsx';
import { LeagueList } from './components/LeagueList/LeagueList.tsx';
import { Team } from './components/Team/Team.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import './index.css';
import { withProtection } from './utils/routeHelpers.tsx';

const ProtectedLeagueList = withProtection(LeagueList);
const ProtectedLeague = withProtection(League);
const ProtectedTeam = withProtection(Team);
const ProtectedAccount = withProtection(Account);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster position="top-center" />
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public routes */}
            <Route index element={<LandingPage />} />
            <Route path="/sign-in" element={<SignInForm />} />
            <Route path="/sign-up" element={<SignUpForm />} />

            {/* Protected routes */}
            <Route path="/leagues" element={<ProtectedLeagueList />} />
            <Route path="/league/:leagueId" element={<ProtectedLeague />} />
            <Route path="/team/:teamId" element={<ProtectedTeam />} />
            <Route path="/account" element={<ProtectedAccount />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
