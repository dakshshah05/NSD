import React from 'react';
import { Lightbulb, Fan, Users, Zap, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '../context/ThemeContext';

const RoomCard = ({ room, onClick }) => {
  const { isDarkMode } = useTheme(); // Use context for reliable switching IF classes fail
  const isWastage = room.status === 'vacant' && (room.lights || room.fans);
  // const isEfficient = !isWastage && (room.status === 'occupied' || (!room.lights && !room.fans));
  
  // Dynamic Styles based on isDarkMode (Backup to CSS classes)
  // We will still use Tailwind classes but this logic block helps organize it.
  
  let statusColor = "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]"; 
  let statusBadge = isDarkMode 
    ? "bg-emerald-500/20 text-emerald-300" 
    : "bg-emerald-500/20 text-[#022c22]";
  let statusText = "Efficient";

  if (isWastage) {
    statusColor = "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
    statusBadge = isDarkMode
      ? "bg-red-500/20 text-red-300"
      : "bg-red-500/20 text-[#450a0a]";
    statusText = "Wastage Detect";
  } else if (room.power > 500 && room.status === 'occupied') { 
    statusColor = "border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]";
    statusBadge = isDarkMode
      ? "bg-yellow-500/20 text-yellow-300"
      : "bg-yellow-500/20 text-[#422006]";
    statusText = "High Load";
  }

  return (
    <div 
      onClick={() => onClick(room)}
      className={clsx(
        "bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-5 cursor-pointer transition-all hover:scale-105 hover:bg-[rgb(var(--bg-input))] relative group overflow-hidden",
        statusColor
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <h3 className="text-lg font-bold text-[rgb(var(--text-main))]">{room.name}</h3>
        <span className={clsx("text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1", statusBadge)}>
           {isWastage && <AlertTriangle size={12} />}
           {statusText}
        </span>
      </div>

      <p className="text-xs text-[rgb(var(--text-muted))] mb-4">{room.block}</p>

      {/* Grid of stats */}
      <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
        <div className="bg-[rgb(var(--bg-input))]/50 p-2 rounded-lg flex items-center space-x-2">
           <Users size={16} className={room.status === 'occupied' 
              ? (isDarkMode ? "text-emerald-400" : "text-[#022c22]") 
              : "text-[rgb(var(--text-muted))]"
           } />
           <span className="text-sm text-[rgb(var(--text-sec))]">{room.status === 'occupied' ? 'Occupied' : 'Vacant'}</span>
        </div>
        <div className="bg-[rgb(var(--bg-input))]/50 p-2 rounded-lg flex items-center space-x-2">
           <Zap size={16} className={isDarkMode ? "text-yellow-400" : "text-[#422006]"} />
           <span className="text-sm text-[rgb(var(--text-sec))]">{room.power}W</span>
        </div>
      </div>

      {/* Device Status */}
      <div className="flex space-x-3 relative z-10">
        <div className={clsx(
            "flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
            room.lights 
              ? (isDarkMode ? "bg-yellow-400/20 text-yellow-200" : "bg-yellow-400/20 text-[#422006]") 
              : "bg-[rgb(var(--bg-input))] text-[rgb(var(--text-muted))]"
        )}>
            <Lightbulb size={14} className={room.lights 
              ? (isDarkMode ? "fill-yellow-200" : "fill-[#422006]") 
              : ""} 
            />
            <span>{room.lights ? "ON" : "OFF"}</span>
        </div>
        <div className={clsx(
            "flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
            room.fans 
              ? (isDarkMode ? "bg-blue-400/20 text-blue-200" : "bg-blue-400/20 text-[#172554]") 
              : "bg-[rgb(var(--bg-input))] text-[rgb(var(--text-muted))]"
        )}>
            <Fan size={14} className={room.fans ? "animate-spin-slow" : ""} />
            <span>{room.fans ? "ON" : "OFF"}</span>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className={clsx(
          "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20",
          isWastage ? "bg-red-500" : "bg-emerald-500"
      )}></div>
    </div>
  );
};

export default RoomCard;
