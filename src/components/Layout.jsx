import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine title based on current path
  const getPageTitle = (path) => {
    switch(path) {
      case '/': return 'Dashboard Overview';
      case '/rooms': return 'Live Room Status';
      case '/analytics': return 'Energy Analytics';
      case '/recommendations': return 'AI Optimization Engine';
      case '/controls': return 'Smart Controls';
      case '/settings': return 'System Settings';
      case '/profile': return 'User Profile';
      default: return 'Smart Energy System';
    }
  };

  return (
    <div className="h-screen bg-[rgb(var(--bg-main))] text-[rgb(var(--text-main))] flex overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 h-full">
        <Header 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          title={getPageTitle(location.pathname)}
        />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
