import React, { useState } from 'react';
import { Bell, Shield, User, Smartphone, Save } from 'lucide-react';
import { clsx } from 'clsx';
import { getMockData } from '../data/mockData';
import { useDate } from '../context/DateContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

const SettingSection = ({ title, icon: Icon, children }) => (
  <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-6 mb-6">
    <div className="flex items-center space-x-3 mb-6">
      <div className="p-2 bg-[rgb(var(--bg-input))] rounded-lg">
        <Icon className="text-emerald-400" size={20} />
      </div>
      <h3 className="text-lg font-bold text-[rgb(var(--text-main))]">{title}</h3>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const ToggleRow = ({ label, desc, enabled, onToggle }) => {
   const [isOn, setIsOn] = useState(enabled);
   
   const handleToggle = () => {
       const newState = !isOn;
       setIsOn(newState);
       if (onToggle) onToggle(newState);
   };

   return (
      <div className="flex items-center justify-between py-2">
         <div>
            <p className="text-sm font-medium text-[rgb(var(--text-sec))]">{label}</p>
            <p className="text-xs text-[rgb(var(--text-muted))]">{desc}</p>
         </div>
         <button
            onClick={handleToggle}
            className={clsx(
               "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
               isOn ? "bg-emerald-500" : "bg-[rgb(var(--text-muted))]"
            )}
         >
            <span className={clsx(
               "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
               isOn ? "translate-x-6" : "translate-x-1"
            )} />
         </button>
      </div>
   )
}


const Settings = () => {
  const { selectedDate } = useDate();
  const { addNotification } = useNotifications();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const handlePushToggle = (enabled) => {
      if (enabled) {
          addNotification('System Alert', 'Push Notifications Enabled');
      } else {
          addNotification('System Alert', 'Push Notifications Disabled');
      }
  };

  const handleSave = () => {
      addNotification('Configuration Check', 'System settings saved successfully.');
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in relative">
      <h2 className="text-2xl font-bold text-[rgb(var(--text-main))] mb-6">System Configuration</h2>
      
      <SettingSection title="Notifications" icon={Bell}>
         <ToggleRow 
            label="Push Notifications" 
            desc="Receive alerts on mobile app & desktop" 
            enabled={false} 
            onToggle={handlePushToggle}
         />
         <ToggleRow label="Email Reports" desc="Weekly energy summary" enabled={true} />
         <ToggleRow label="Critical Alerts" desc="Immediate alert for power surges" enabled={true} />
      </SettingSection>

      <SettingSection title="System Preferences" icon={Smartphone}>
         <ToggleRow 
            label="Dark Mode" 
            desc="System-wide dark interface" 
            enabled={isDarkMode} 
            onToggle={toggleTheme}
         />
         <ToggleRow label="Auto-Refresh" desc="Live data updates every 30s" enabled={true} />
      </SettingSection>

      <SettingSection title="Account & Security" icon={Shield}>
         <div className="flex items-center justify-between py-2">
            <div>
               <p className="text-sm font-medium text-[rgb(var(--text-sec))]">Two-Factor Authentication</p>
               <p className="text-xs text-[rgb(var(--text-muted))]">Enabled</p>
            </div>
            <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">Configure</button>
         </div>
         <div className="flex items-center justify-between py-2">
            <div>
               <p className="text-sm font-medium text-[rgb(var(--text-sec))]">API Access</p>
               <p className="text-xs text-[rgb(var(--text-muted))]">Last accessed 2 hours ago</p>
            </div>
            <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">View Logs</button>
         </div>
      </SettingSection>

      <div className="flex justify-end">
         <button onClick={handleSave} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-600/20">
            <Save size={18} />
            <span>Save Changes</span>
         </button>
      </div>
    </div>
  );
};

export default Settings;
