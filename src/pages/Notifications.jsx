import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const { notifications, clearNotifications, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto animate-fade-in p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg bg-[rgb(var(--bg-input))] text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-main))] transition-colors shrink-0"
            >
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-2xl font-bold text-[rgb(var(--text-main))] flex items-center gap-2">
                    <Bell className="text-emerald-400" />
                    Notification History
                </h1>
                <p className="text-[rgb(var(--text-muted))] text-sm">View and manage all system alerts</p>
            </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
            <button 
                onClick={markAllAsRead}
                className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-[rgb(var(--text-main))] bg-[rgb(var(--bg-input))] rounded-lg hover:bg-opacity-80 transition-all text-center"
            >
                Mark all read
            </button>
            <button 
                onClick={clearNotifications}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
            >
                <Trash2 size={16} />
                Clear All
            </button>
        </div>
      </div>

      <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-2xl overflow-hidden shadow-lg">
        {notifications.length > 0 ? (
            <div className="divide-y divide-[rgb(var(--border))]">
                {notifications.map(n => (
                    <div key={n.id} className={`p-4 transition-colors hover:bg-[rgb(var(--bg-input))]/50 ${!n.read ? "bg-emerald-500/5" : ""}`}>
                        <div className="flex justify-between items-start mb-1">
                            <h3 className={`text-base font-semibold ${!n.read ? "text-[rgb(var(--text-main))]" : "text-[rgb(var(--text-sec))]"}`}>
                                {n.title}
                            </h3>
                            <span className="text-xs text-[rgb(var(--text-muted))] whitespace-nowrap ml-4">{n.time}</span>
                        </div>
                        <p className="text-sm text-[rgb(var(--text-muted))]">{n.message}</p>
                    </div>
                ))}
            </div>
        ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center text-[rgb(var(--text-muted))]">
                <Bell size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
