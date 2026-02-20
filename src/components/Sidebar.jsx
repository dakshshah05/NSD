import React, { useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Zap,
  BarChart3,
  Lightbulb,
  Settings,
  Cpu,
  X,
  FileText,
  LogOut,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAuth } from "../context/AuthContext";

gsap.registerPlugin(useGSAP);

const Sidebar = ({ isOpen, onClose }) => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  useGSAP(
    () => {
      gsap.fromTo(
        ".nav-item",
        { x: -20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.2,
        },
      );
    },
    { scope: containerRef },
  );

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Live Rooms", path: "/rooms", icon: Zap },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "AI Recommendations", path: "/recommendations", icon: Cpu },
    { name: "Reports", path: "/reports", icon: FileText },
    { name: "Smart Controls", path: "/controls", icon: Lightbulb },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        ref={containerRef}
        className={twMerge(
          "fixed top-0 left-0 h-full w-64 bg-[rgb(var(--bg-card))] border-r border-[rgb(var(--border))] z-[60] pt-[env(safe-area-inset-top)] transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--border))] h-16">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Zap size={28} fill="currentColor" />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              EnergyGuard
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) onClose();
              }}
              className={({ isActive }) =>
                clsx(
                  "nav-item flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group font-medium",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]"
                    : "text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-input))] hover:text-[rgb(var(--text-main))]",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={20}
                    className={
                      isActive
                        ? "text-emerald-400"
                        : "text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--text-sec))]"
                    }
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]/50 backdrop-blur">
          <div className="flex items-center space-x-3 text-[rgb(var(--text-muted))] transition-colors">
            <button 
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg shrink-0 hover:ring-2 hover:ring-emerald-400 focus:outline-none transition-all"
              title="View Profile"
            >
              <span className="text-xs font-bold text-white">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </button>
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate('/profile')}>
              <p className="text-sm font-medium text-[rgb(var(--text-main))] truncate hover:text-emerald-400 transition-colors" title={user?.email}>
                {user?.email || 'User'}
              </p>
              <p className="text-xs text-[rgb(var(--text-muted))]">Authorized User</p>
            </div>
            <button
              onClick={handleLogout}
              className="hover:text-red-400 transition-colors p-1 shrink-0"
              title="Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
