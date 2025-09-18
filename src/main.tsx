import { SignInForm } from '@/components/auth/SignInForm/SignInForm.tsx';
import { SignUpForm } from '@/components/auth/SingUpForm/SignUpForm.tsx';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';

import App from './App.tsx';
import { Account } from './components/Account/Account.tsx';
import { LandingPage } from './components/LandingPage/LandingPage.tsx';
import { Layout } from './components/Layout/Layout.tsx';
import { Team } from './components/Team/Team.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="/sign-in" element={<SignInForm />} />
            <Route path="/sign-up" element={<SignUpForm />} />
            <Route path="/dashboard" element={<App />} />
            <Route path="/team/:teamId" element={<Team />} />
            <Route path="/account" element={<Account />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
