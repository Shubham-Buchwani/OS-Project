import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore.js';
import { useUIStore } from './stores/uiStore.js';
import AppLayout from './layouts/AppLayout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SimulationsPage from './pages/SimulationsPage.jsx';
import SimulationRunPage from './pages/SimulationRunPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import ProgressPage from './pages/ProgressPage.jsx';
import ToastContainer from './components/ui/ToastContainer.jsx';

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Protected */}
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/dashboard"            element={<DashboardPage />} />
          <Route path="/simulations"          element={<SimulationsPage />} />
          <Route path="/simulations/:id/run"  element={<SimulationRunPage />} />
          <Route path="/history"              element={<HistoryPage />} />
          <Route path="/progress"             element={<ProgressPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
