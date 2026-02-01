import React, { useState } from 'react';
import { roomStatusData } from '../data/mockData';
import ControlCard from '../components/ControlCard';
import { Sliders } from 'lucide-react';

const Controls = () => {
  // Initialize state with a new property 'automation' added to each room
  const [rooms, setRooms] = useState(roomStatusData.map(r => ({ ...r, automation: true })));

  const handleUpdate = (id, updates) => {
    setRooms(prevRooms => 
      prevRooms.map(room => 
        room.id === id ? { ...room, ...updates } : room
      )
    );
    
    // In a real app, send API request here.
    // For demo, we can show a toast or just log.
    // console.log(`Updated room ${id}`, updates);
  };

  const handleGlobalAutomationPayload = (enable) => {
      setRooms(prev => prev.map(r => ({...r, automation: enable})));
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
         <div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Sliders size={24} className="text-emerald-400" />
                Global Controls
            </h2>
            <p className="text-slate-400 text-sm">Manage all sensors and devices across campus</p>
         </div>
         <div className="flex gap-3">
             <button 
                onClick={() => handleGlobalAutomationPayload(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-all"
             >
                Manual Override All
             </button>
             <button 
                onClick={() => handleGlobalAutomationPayload(true)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all shadow-lg shadow-emerald-600/20"
             >
                Enable All Automation
             </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {rooms.map(room => (
            <ControlCard key={room.id} room={room} onUpdate={handleUpdate} />
         ))}
      </div>
    </div>
  );
};

export default Controls;
