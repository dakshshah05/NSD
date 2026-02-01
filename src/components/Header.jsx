import { useDate } from '../context/DateContext';
import { Menu, Bell, Sun, Moon, Search, Calendar } from 'lucide-react';

const Header = ({ onMenuClick, title }) => {
  const { selectedDate, setSelectedDate, today } = useDate();

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 md:px-6 flex items-center justify-between shrink-0 transition-all duration-300">
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-slate-400 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg md:text-xl font-semibold text-white tracking-wide">
          {title}
        </h1>
      </div>

      <div className="flex items-center space-x-3 md:space-x-6">
        
        {/* Date Picker */}
        <div className="flex items-center bg-slate-800 rounded-full px-3 py-1.5 border border-slate-700">
            <Calendar size={14} className="text-emerald-400 mr-2" />
            <input 
                type="date" 
                value={selectedDate}
                max={today}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm text-slate-200 focus:outline-none w-28 md:w-auto"
            />
        </div>

        {/* Search Bar - Hidden on small mobile */}
        <div className="hidden md:flex items-center relative">
          <Search size={16} className="absolute left-3 text-slate-500" />
          <input 
            type="text"
            placeholder="Search rooms, staff..."
            className="bg-slate-800 border-none rounded-full py-1.5 pl-9 pr-4 text-sm text-slate-200 focus:ring-1 focus:ring-emerald-500 w-64 placeholder:text-slate-500 transition-all hover:bg-slate-700"
          />
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <button className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-all">
            <Sun size={20} />
          </button>
          
          <button className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-slate-900"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
