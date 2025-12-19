import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Dashboard } from '@/pages/Dashboard';
import { Leads } from '@/pages/Leads';
import { Analysis } from '@/pages/Analysis';
import { TrafficDashboard } from '@/pages/traffic/TrafficDashboard';
import { Settings } from '@/pages/Settings';
import { Login } from '@/pages/Login';
import { LeadsProvider } from '@/context/LeadsContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { TrafficProvider } from '@/context/TrafficContext';
import { LaunchProvider } from '@/context/LaunchContext';
import LaunchList from '@/pages/launch/LaunchList';
import LaunchForm from '@/pages/launch/LaunchForm';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TrafficProvider>
          <LaunchProvider>
            <LeadsProvider>
              <BrowserRouter>
                <ErrorBoundary name="Rotas App">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes */}
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Layout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Dashboard />} />
                      <Route path="leads" element={<Leads />} />
                      <Route path="traffic" element={<TrafficDashboard />} />

                      {/* Launch Routes */}
                      <Route path="launches" element={<LaunchList />} />
                      <Route path="launches/new" element={<LaunchForm />} />
                      {/* LaunchDashboard removed as per user request (moved to Traffic) */}
                      <Route path="launches/edit/:id" element={<LaunchForm />} />

                      <Route path="analysis" element={<Analysis />} />
                      <Route path="filters" element={<div className="p-8">Filtros Avançados (Em breve)</div>} />
                      <Route path="export" element={<div className="p-8">Exportação (Em breve)</div>} />
                      <Route path="settings" element={<Settings />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </ErrorBoundary>
              </BrowserRouter>
            </LeadsProvider>
          </LaunchProvider>
        </TrafficProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
