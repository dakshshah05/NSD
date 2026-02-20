import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  // Initialize from localStorage if available, else default
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : {
      emailReports: true,
      criticalAlerts: true,
      pushNotifications: false,
      autoRefresh: true,
      twoFactor: true
    };
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
