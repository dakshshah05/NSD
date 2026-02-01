import React from 'react';
import { Lightbulb, Fan, Users, Zap, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

const RoomCard = ({ room, onClick }) => {
  const isWastage = room.status === 'vacant' && (room.lights || room.fans);
  const isEfficient = !isWastage && (room.status === 'occupied' || (!room.lights && !room.fans));
  
  let statusColor = "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]"; 
  let statusBadge = "bg-emerald-500/20 text-emerald-300";
  let statusText = "Efficient";

  if (isWastage) {
    statusColor = "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
    statusBadge = "bg-red-500/20 text-red-300";
    statusText = "Wastage Detect";
  } else if (room.power > 500 && room.status === 'occupied') { 
    statusColor = "border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]";
    statusBadge = "bg-yellow-500/20 text-yellow-300";
    statusText = "High Load";
  }

  return (
    <div 
      onClick={() => onClick(room)}
      className={clsx(
        "bg-slate-900 border rounded-xl p-5 cursor-pointer transition-all hover:scale-105 hover:bg-slate-800 relative group overflow-hidden",
        statusColor
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <h3 className="text-lg font-bold text-white">{room.name}</h3>
        <span className={clsx("text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1", statusBadge)}>
           {isWastage && <AlertTriangle size={12} />}
           {statusText}
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-4">{room.block}</p>

      {/* Grid of stats */}
      <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
        <div className="bg-slate-950/50 p-2 rounded-lg flex items-center space-x-2">
           <Users size={16} className={room.status === 'occupied' ? "text-emerald-400" : "text-slate-600"} />
           <span className="text-sm text-slate-300">{room.status === 'occupied' ? 'Occupied' : 'Vacant'}</span>
        </div>
        <div className="bg-slate-950/50 p-2 rounded-lg flex items-center space-x-2">
           <Zap size={16} className="text-yellow-400" />
           <span className="text-sm text-slate-300">{room.power}W</span>
        </div>
      </div>

      {/* Device Status */}
      <div className="flex space-x-3 relative z-10">
        <div className={clsx(
            "flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
            room.lights ? "bg-yellow-400/20 text-yellow-200" : "bg-slate-800 text-slate-500"
        )}>
            <Lightbulb size={14} className={room.lights ? "fill-yellow-200" : ""} />
            <span>{room.lights ? "ON" : "OFF"}</span>
        </div>
        <div className={clsx(
            "flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
            room.fans ? "bg-blue-400/20 text-blue-200" : "bg-slate-800 text-slate-500"
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
