import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';

// Lazy load components
const Dashboard = lazy(() =>
  import('./dashboard/pages/Dashboard').catch(() => ({ default: FallbackDashboard }))
);

const LiveTracking = lazy(() =>
  import('./dashboard/pages/LiveTracking').catch(() => ({ default: FallbackLiveTracking }))
);

const QuickView = lazy(() =>
  import('./dashboard/pages/QuickView').catch(() => ({ default: FallbackQuickView }))
);

const Login = lazy(() =>
  import('./auth/pages/Login').catch(() => ({ default: FallbackLogin }))
);

const ThemeDemo = lazy(() =>
  import('./dashboard/pages/ThemeDemo').catch(() => ({ default: FallbackThemeDemo }))
);

const ThemeProvider = lazy(() =>
  import('./dashboard/context/ThemeContext').then(m => ({ default: m.ThemeProvider })).catch(() => ({ default: SimpleThemeProvider }))
);

const LanguageProvider = lazy(() =>
  import('./dashboard/context/LanguageContext').then(m => ({ default: m.LanguageProvider })).catch(() => ({ default: SimpleLanguageProvider }))
);

// Fallback components (make sure these are defined in your project)
const FallbackDashboard = () => <div>Dashboard failed to load.</div>;
const FallbackLiveTracking = () => <div>Live Tracking failed to load.</div>;
const FallbackQuickView = () => <div>Quick View failed to load.</div>;
const FallbackLogin = () => <div>Login failed to load.</div>;
const FallbackThemeDemo = () => <div>Theme demo failed to load.</div>;
const SimpleThemeProvider = ({ children }) => <>{children}</>;
const SimpleLanguageProvider = ({ children }) => <>{children}</>;
const LoadingSpinner = () => <div>Loading...</div>;

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: "Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    background: ${props => props.theme?.colors?.background || '#f8fafc'};
    color: ${props => props.theme?.colors?.text?.primary || '#1e293b'};
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  #root {
    min-height: 100vh;
    width: 100%;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || '#f8fafc'};
`;

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LanguageProvider>
        <ThemeProvider>
          <GlobalStyle />
          <AppContainer>
            <Router>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route
                  path="/login"
                  element={
                    <Suspense fallback={<FallbackLogin />}>
                      <Login />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <Suspense fallback={<FallbackDashboard />}>
                      <Dashboard />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/live-tracking"
                  element={
                    <Suspense fallback={<FallbackLiveTracking />}>
                      <LiveTracking />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/quick-view"
                  element={
                    <Suspense fallback={<FallbackQuickView />}>
                      <QuickView />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/theme-demo"
                  element={
                    <Suspense fallback={<FallbackThemeDemo />}>
                      <ThemeDemo />
                    </Suspense>
                  }
                />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Router>
          </AppContainer>
        </ThemeProvider>
      </LanguageProvider>
    </Suspense>
  );
}

export default App;
<LanguageProvider>
  <ThemeProvider>
    ...
  </ThemeProvider>
</LanguageProvider>
