import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ToastProvider from './components/ToastProvider';

// Lazy load components
const Dashboard = lazy(() =>
  import('./dashboard/pages/Dashboard').catch(() => ({ default: FallbackDashboard }))
);

const LiveTracking = lazy(() =>
  import('./dashboard/pages/LiveTracking').catch(() => ({ default: FallbackLiveTracking }))
);

const OldScreenshots = lazy(() =>
  import('./dashboard/pages/OldScreenshots').catch(() => ({ default: FallbackOldScreenshots }))
);

const QuickView = lazy(() =>
  import('./dashboard/pages/QuickView').catch(() => ({ default: FallbackQuickView }))
);

const Login = lazy(() =>
  import('./auth/pages/Login').catch(() => ({ default: FallbackLogin }))
);

const EnhancedLogin = lazy(() =>
  import('./components/auth/EnhancedLogin').catch(() => ({ default: FallbackLogin }))
);

const LoginAPITester = lazy(() =>
  import('./components/LoginAPITester').catch(() => ({ default: FallbackLogin }))
);

const Register = lazy(() =>
  import('./auth/pages/Register').catch(() => ({ default: FallbackRegister }))
);

const EnhancedRegister = lazy(() =>
  import('./components/auth/EnhancedRegister').catch(() => ({ default: FallbackRegister }))
);

const RegistrationAPITester = lazy(() =>
  import('./components/RegistrationAPITester').catch(() => ({ default: FallbackRegister }))
);

const ThemeDemo = lazy(() =>
  import('./dashboard/pages/ThemeDemo').catch(() => ({ default: FallbackThemeDemo }))
);

const Settings = lazy(() =>
  import('./dashboard/pages/Settings').catch(() => ({ default: FallbackSettings }))
);

const Attendance = lazy(() =>
  import('./dashboard/pages/Attandence').catch(() => ({ default: FallbackAttendance }))
);

const Employees = lazy(() =>
  import('./dashboard/pages/Employees').catch(() => ({ default: FallbackEmployees }))
);

const Teams = lazy(() =>
  import('./dashboard/pages/Teams').catch(() => ({ default: FallbackTeams }))
);

const ImageTest = lazy(() =>
  import('./components/ImageTest').catch(() => ({ default: FallbackImageTest }))
);

const ActivityPattern = lazy(() =>
  import('./dashboard/pages/reports/ActivityPattern').catch(() => ({ default: FallbackActivityPattern }))
);

const ThemeProvider = lazy(() =>
  import('./dashboard/context/ThemeContext').then(m => ({ default: m.ThemeProvider })).catch(() => ({ default: SimpleThemeProvider }))
);

const LanguageProvider = lazy(() =>
  import('./dashboard/context/LanguageContext').then(m => ({ default: m.LanguageProvider })).catch(() => ({ default: SimpleLanguageProvider }))
);

// Enhanced Full-Screen Loading Spinner Component
const LoadingSpinner = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    zIndex: 9999,
    overflow: 'hidden'
  }}>
    <div style={{
      width: '80px',
      height: '80px',
      border: '6px solid rgba(255, 255, 255, 0.2)',
      borderTop: '6px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '30px'
    }}></div>
    <h2 style={{ 
      marginBottom: '15px', 
      fontSize: '24px', 
      fontWeight: '600',
      textAlign: 'center'
    }}>Loading Dashboard</h2>
    <p style={{ 
      fontSize: '16px', 
      opacity: 0.9,
      textAlign: 'center',
      maxWidth: '400px',
      lineHeight: '1.5'
    }}>Please wait while we prepare your workspace...</p>
    <div style={{
      marginTop: '40px',
      display: 'flex',
      gap: '8px'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.6)',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}></div>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.6)',
        animation: 'pulse 1.5s ease-in-out 0.2s infinite'
      }}></div>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.6)',
        animation: 'pulse 1.5s ease-in-out 0.4s infinite'
      }}></div>
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }
    `}</style>
  </div>
);

// Fallback components with loaders instead of error messages
const FallbackDashboard = () => <LoadingSpinner />;
const FallbackLiveTracking = () => <LoadingSpinner />;
const FallbackOldScreenshots = () => <LoadingSpinner />;
const FallbackQuickView = () => <LoadingSpinner />;
const FallbackLogin = () => <LoadingSpinner />;
const FallbackRegister = () => <LoadingSpinner />;
const FallbackThemeDemo = () => <LoadingSpinner />;
const FallbackSettings = () => <LoadingSpinner />;
const FallbackAttendance = () => <LoadingSpinner />;
const FallbackEmployees = () => <LoadingSpinner />;
const FallbackTeams = () => <LoadingSpinner />;
const FallbackImageTest = () => <LoadingSpinner />;
const FallbackActivityPattern = () => <LoadingSpinner />;
const SimpleThemeProvider = ({ children }) => <>{children}</>;
const SimpleLanguageProvider = ({ children }) => <>{children}</>;

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: "Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    background: #ecf3fc;
    color: #1e293b;
    transition: background-color 0.3s ease, color 0.3s ease;
    position: relative;
  }

  /* Global background mask */
  body::before {
    content: "";
    position: fixed;
    background-image: url('https://dash.focusro.com/assets/images/a.png');
    background-size: cover;
    height: 831px;
    left: 0;
    top: 0;
    width: 350px;
  }

  body::after {
    content: "";
    position: fixed;
    background-image: url('https://dash.focusro.com/assets/images/b.png');
    background-size: cover;
    height: 850px;
    right: 0;
    bottom: -80px;
    width: 370px;
  }

  #root {
    min-height: 100vh;
    width: 100%;
    position: relative;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: transparent;
  position: relative;
`;

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ToastProvider>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              <GlobalStyle />
              <AppContainer className="wrapper has-mask">
              <Router>
                <Routes>
                  <Route path="/" element={<Navigate to="/admin-panel" replace />} />
                  <Route
                    path="/login"
                    element={
                      <Suspense fallback={<FallbackLogin />}>
                        <Login />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/login-enhanced"
                    element={
                      <Suspense fallback={<FallbackLogin />}>
                        <EnhancedLogin />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/test-login"
                    element={
                      <Suspense fallback={<FallbackLogin />}>
                        <LoginAPITester />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <Suspense fallback={<FallbackRegister />}>
                        <Register />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/register-enhanced"
                    element={
                      <Suspense fallback={<FallbackRegister />}>
                        <EnhancedRegister />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/test-registration"
                    element={
                      <Suspense fallback={<FallbackRegister />}>
                        <RegistrationAPITester />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<FallbackDashboard />}>
                          <Dashboard />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin-panel"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<FallbackDashboard />}>
                          <Dashboard />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/live-tracking"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<FallbackLiveTracking />}>
                          <LiveTracking />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/old-screenshots"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<FallbackOldScreenshots />}>
                          <OldScreenshots />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/quick-view"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<FallbackQuickView />}>
                          <QuickView />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/theme-demo"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<FallbackThemeDemo />}>
                          <ThemeDemo />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/settings"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<FallbackSettings />}>
                          <Settings />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/settings/style"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<FallbackSettings />}>
                          <Settings />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/settings/credentials"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<FallbackSettings />}>
                          <Settings />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/settings/upload"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<FallbackSettings />}>
                          <Settings />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/settings/database"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<FallbackSettings />}>
                          <Settings />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/settings/aws"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<FallbackSettings />}>
                          <Settings />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/attendence"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<FallbackAttendance />}>
                          <Attendance />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/employees"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<FallbackEmployees />}>
                          <Employees />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/teams"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<FallbackTeams />}>
                          <Teams />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/reports/activity-pattern"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<FallbackActivityPattern />}>
                          <ActivityPattern />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/image-test"
                    element={
                      <Suspense fallback={<FallbackImageTest />}>
                        <ImageTest />
                      </Suspense>
                    }
                  />
                  <Route path="*" element={<Navigate to="/admin-panel" replace />} />
                </Routes>
              </Router>
              </AppContainer>
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </ToastProvider>
    </Suspense>
  );
}export default App;
