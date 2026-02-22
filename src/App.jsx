import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Impact from './pages/Impact';
import MiniGames from './pages/MiniGames';
import Rooms from './pages/Rooms';
import Analytics from './pages/Analytics';
import Recommendations from './pages/Recommendations';
import Controls from './pages/Controls';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

import { DateProvider } from './context/DateContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
    <DateProvider>
      <SettingsProvider>
      <NotificationProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/impact" element={<Impact />} />
                    <Route path="/games" element={<MiniGames />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/recommendations" element={<Recommendations />} />

                    {/* Teacher & Admin Routes */}
                    <Route path="/rooms" element={
                        <ProtectedRoute allowedRoles={['admin', 'teacher']}><Rooms /></ProtectedRoute>
                    } />
                    <Route path="/analytics" element={
                        <ProtectedRoute allowedRoles={['admin', 'teacher']}><Analytics /></ProtectedRoute>
                    } />
                    <Route path="/reports" element={
                        <ProtectedRoute allowedRoles={['admin', 'teacher']}><Reports /></ProtectedRoute>
                    } />

                    {/* Admin Only Routes */}
                    <Route path="/controls" element={
                        <ProtectedRoute allowedRoles={['admin']}><Controls /></ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                        <ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>
                    } />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
      </NotificationProvider>
      </SettingsProvider>
    </DateProvider>
    </ThemeProvider>
  );
}

export default App;
