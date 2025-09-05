import { League } from './components/League/League';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <ProtectedRoute>
      <League />
    </ProtectedRoute>
  );
}

export default App;
