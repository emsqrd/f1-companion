import { useState } from 'react';

import { Button } from '../ui/button';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';

type AuthMode = 'login' | 'signup';

interface AuthPageProps {
  initialMode?: AuthMode;
}

export function AuthPage({ initialMode = 'login' }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  return (
    <div className="flex min-h-screen w-full max-w-md items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        {mode === 'login' ? <LoginForm /> : <SignUpForm />}

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-sm"
          >
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </Button>
        </div>
      </div>
    </div>
  );
}
