import { useState, useRef, useEffect } from "react";
import { useDate } from "../context/DateContext";
import { useNotifications } from "../context/NotificationContext";
import {
  Menu,
  Bell,
  Sun,
  Moon,
  Search,
  Calendar,
  CheckCheck,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useTheme } from "../context/ThemeContext";

const Header = ({ onMenuClick, title }) => {
  const { selectedDate, setSelectedDate, today } = useDate();
  const { notifications, unreadCount, markAllAsRead, clearNotifications } =
    useNotifications();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);
  const dateInputRef = useRef(null);
  const notifRef = useRef(null);
  
  const handleDateClick = () => {
    try {
      if (dateInputRef.current) {
        if ('showPicker' in HTMLInputElement.prototype) {
          dateInputRef.current.showPicker();
        } else {
          dateInputRef.current.click();
        }
      }
    } catch (err) {
      console.warn("showPicker error:", err);
      dateInputRef.current?.click();
    }
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchInput.trim()) {
      navigate("/rooms", { state: { searchTerm: searchInput } });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-[rgb(var(--bg-card))]/80 backdrop-blur-md border-b border-[rgb(var(--border))] px-4 md:px-6 flex items-center justify-between shrink-0 transition-all duration-300 z-50 sticky top-0">
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-main))] transition-colors"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg md:text-xl font-semibold text-[rgb(var(--text-main))] tracking-wide">
          {title}
        </h1>
      </div>

      <div className="flex items-center space-x-3 md:space-x-6">
        {/* Date Picker */}
        <div 
          onClick={handleDateClick}
          className="relative flex items-center bg-[rgb(var(--bg-input))] rounded-full p-2 md:px-3 border border-[rgb(var(--border))] group/calendar transition-all hover:bg-emerald-500/5 cursor-pointer overflow-hidden"
        >
          <Calendar size={14} className="text-emerald-400 md:mr-2 shrink-0 pointer-events-none" />
          <span className="text-xs text-[rgb(var(--text-main))] font-medium group-hover/calendar:text-emerald-400 transition-colors pointer-events-none">
            {new Date(selectedDate)
              .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
              .replace(/\//g, "-")}
          </span>
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            max={today}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center relative">
          <Search
            size={16}
            className="absolute left-3 text-[rgb(var(--text-muted))]"
          />
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearch}
            className="bg-[rgb(var(--bg-input))] border-none rounded-full py-1.5 pl-9 pr-4 text-sm text-[rgb(var(--text-main))] focus:ring-1 focus:ring-emerald-500 w-64 placeholder:text-[rgb(var(--text-muted))] transition-all hover:bg-opacity-80"
          />
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-[rgb(var(--text-muted))] hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-all"
          >
            {isDarkMode ? (
              <Sun size={20} />
            ) : (
              <Moon size={20} className="text-[rgb(var(--text-main))]" />
            )}
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                if (!showNotifs) markAllAsRead();
              }}
              className="p-2 text-[rgb(var(--text-muted))] hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-all relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-[rgb(var(--bg-card))]"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifs && (
              <div className="absolute right-0 top-12 w-80 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl shadow-2xl overflow-hidden animate-fade-in origin-top-right">
                <div className="p-3 border-b border-[rgb(var(--border))] flex justify-between items-center bg-[rgb(var(--bg-input))]/50">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[rgb(var(--text-main))]">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span className="bg-emerald-500 text-white text-[10px] px-1.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-[10px] font-medium text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifs(false)}
                      className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-main))]"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-[rgb(var(--border))]">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 border-b border-[rgb(var(--border))]/50 hover:bg-[rgb(var(--bg-input))] transition-colors ${
                          !n.read ? "bg-emerald-500/5" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium text-[rgb(var(--text-main))]">
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-[rgb(var(--text-muted))]">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                          {n.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-[rgb(var(--text-muted))] text-sm">
                      No new notifications
                    </div>
                  )}
                </div>
                <div className="p-2 bg-[rgb(var(--bg-input))]/30 text-center border-t border-[rgb(var(--border))]">
                  <button
                    onClick={() => {
                      setShowNotifs(false);
                      navigate("/notifications");
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium w-full py-1"
                  >
                    View All History
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
