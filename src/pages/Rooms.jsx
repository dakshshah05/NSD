import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import RoomCard from '../components/RoomCard';
import { fetchRoomStatus } from '../data/historicalData'; 
import { useDate } from '../context/DateContext';
import { useLocation } from 'react-router-dom';

const Rooms = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
  const [filter, setFilter] = useState('all'); // all, occupied, vacant, wastage
  
  const { selectedDate } = useDate();
  const [roomStatusData, setRoomStatusData] = useState([]);

  useEffect(() => {
      async function load() {
          const data = await fetchRoomStatus();
          setRoomStatusData(data || []);
      }
      load();
  }, [selectedDate]); // Re-fetch on date change? Supabase table is static currently but good practice.


  // React to search from Header
  useEffect(() => {
    if (location.state?.searchTerm) {
        setSearchTerm(location.state.searchTerm);
    }
  }, [location.state]);

  // Filter logic
  const filteredRooms = roomStatusData.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          room.block.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'occupied') matchesFilter = room.status === 'occupied';
    if (filter === 'vacant') matchesFilter = room.status === 'vacant';
    if (filter === 'wastage') matchesFilter = room.status === 'vacant' && (room.lights || room.fans);

    return matchesSearch && matchesFilter;
  });

  const handleRoomClick = (room) => {
    // In a real app, this would open a modal
    console.log("Clicked room:", room);
    // Maybe trigger a toast
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters & Search */}
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-[rgb(var(--bg-card))]/50 p-4 rounded-xl border border-[rgb(var(--border))] backdrop-blur-sm">
        <div className="flex items-center space-x-2 md:space-x-4 w-full md:w-auto mb-4 md:mb-0">
           <Filter className="text-emerald-400" size={20} />
           <div className="flex space-x-2 overflow-x-auto">
             {['all', 'occupied', 'vacant', 'wastage'].map(f => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                   filter === f 
                     ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
                     : 'bg-[rgb(var(--bg-input))] text-slate-800 dark:text-slate-300 hover:bg-opacity-80'
                 }`}
               >
                 {f}
               </button>
             ))}
           </div>
        </div>

        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-2.5 text-[rgb(var(--text-muted))]" size={18} />
           <input 
             type="text" 
             placeholder="Search rooms..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-[rgb(var(--bg-input))] border border-[rgb(var(--border))] rounded-lg py-2 pl-10 pr-4 text-[rgb(var(--text-main))] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-[rgb(var(--text-muted))]"
           />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.map(room => (
          <RoomCard key={room.id} room={room} onClick={handleRoomClick} />
        ))}
        {filteredRooms.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
             <p>No rooms found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;
