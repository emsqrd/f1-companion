import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { League } from './components/League/League';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    // This component is now accessed via /dashboard
    // If someone tries to access / while authenticated, they'll be redirected here
  }, [navigate]);

  return (
    <ProtectedRoute>
      <League />
    </ProtectedRoute>
  );
}

export default App;
