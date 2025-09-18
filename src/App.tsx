import { ProtectedRoute } from '@/components/auth/ProtectedRoute/ProtectedRoute.tsx';

import { League } from './components/League/League';

function App() {
  return (
    <ProtectedRoute>
      <League />
    </ProtectedRoute>
  );
}

export default App;
