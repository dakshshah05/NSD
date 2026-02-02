import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Analytics from './pages/Analytics';
import Recommendations from './pages/Recommendations';
import Controls from './pages/Controls';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';

import { DateProvider } from './context/DateContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
    <DateProvider>
      <NotificationProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/controls" element={<Controls />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
            </Routes>
          </Layout>
        </Router>
      </NotificationProvider>
    </DateProvider>
    </ThemeProvider>
  );
}

export default App;
