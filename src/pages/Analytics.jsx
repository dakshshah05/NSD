import React, { useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip,
  ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { getMockData } from '../data/mockData';
import { fetchDailyStats } from '../data/historicalData';
import { useDate } from '../context/DateContext';
import { AlertTriangle, TrendingUp, Info } from 'lucide-react';

const Analytics = () => {
  const { selectedDate } = useDate();
  const [dayData, setDayData] = useState(null);

  React.useEffect(() => {
      async function load() {
          setDayData(null);
          let data = await fetchDailyStats(selectedDate);
          if (!data) data = getMockData(selectedDate); // Fallback
          setDayData(data);
      }
      load();
  }, [selectedDate]);

  if (!dayData) return <div className="p-10 text-center opacity-50">Loading Analytics...</div>;
  
  // Dynamic Data
  const usageBreakdown = dayData.usageBreakdown || [
      { name: 'Productive', value: 70, color: '#10b981' }, 
      { name: 'Idle', value: 20, color: '#f59e0b' },
      { name: 'Wastage', value: 10, color: '#ef4444' }
  ];
  
  const heatmap = dayData.heatmap || [];
  
  // Transform dayData.trends for the ComposedChart
  // We need to simulate 'occupancy' based on the scenario
  const getOccupancy = (hour) => {
     const isWeekend = dayData.scenario === 'WEEKEND';
     const isNight = hour < 8 || hour > 20;
     
     if (isWeekend) return isNight ? 10 : 30; // Low occupancy on weekends
     if (isNight) return 20; // Some hostel/lab activity
     return 85 + Math.random() * 15; // High occupancy
  };

  const occupancyVsEnergy = dayData.trends.map(t => {
      const hour = parseInt(t.time.split(':')[0]);
      return {
          time: t.time,
          energy: t.energy,
          occupancy: Math.floor(getOccupancy(hour))
      };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Wastage Pie Chart */}
        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-2xl p-6 shadow-lg lg:col-span-1">
          <h3 className="text-lg font-bold text-[rgb(var(--text-main))] mb-2">Energy Efficiency</h3>
          <p className="text-xs text-[rgb(var(--text-muted))] mb-6">Breakdown of power usage types</p>
          <div className="h-64 relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie
                    data={usageBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {usageBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <ReTooltip 
                     contentStyle={{ backgroundColor: 'rgb(var(--bg-card))', borderColor: 'rgb(var(--border))', borderRadius: '8px', color: 'rgb(var(--text-main))' }}
                     itemStyle={{ color: 'rgb(var(--text-main))' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
               </PieChart>
             </ResponsiveContainer>
             {/* Center Text */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                <span className="text-3xl font-bold text-[rgb(var(--text-main))]">{usageBreakdown[0].value}%</span>
                <p className="text-xs text-[rgb(var(--text-muted))]">Efficient</p>
             </div>
          </div>
        </div>

        {/* Occupancy vs Energy */}
        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-2xl p-6 shadow-lg lg:col-span-2">
           <div className="flex justify-between items-start mb-2">
               <div>
                   <h3 className="text-lg font-bold text-[rgb(var(--text-main))]">Occupancy vs. Energy</h3>
                   <p className="text-xs text-[rgb(var(--text-muted))]">Correlation for {selectedDate} ({dayData.scenario})</p>
               </div>
               <div className="bg-[rgb(var(--bg-input))] px-3 py-1 rounded-full text-xs text-emerald-400 border border-[rgb(var(--border))]">
                   {(dayData.totalConsumption || 0).toLocaleString()} kWh Total
               </div>
           </div>
           
           <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart key={`composed-${selectedDate}`} data={occupancyVsEnergy}>
                 <CartesianGrid stroke="rgb(var(--border))" strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="time" stroke="rgb(var(--text-muted))" />
                 <YAxis yAxisId="left" stroke="rgb(var(--text-muted))" label={{ value: 'Occupancy', angle: -90, position: 'insideLeft', fill: 'rgb(var(--text-muted))' }} />
                 <YAxis yAxisId="right" orientation="right" stroke="#10b981" label={{ value: 'Energy (kWh)', angle: 90, position: 'insideRight', fill: '#10b981' }} />
                 <ReTooltip contentStyle={{ backgroundColor: 'rgb(var(--bg-card))', borderColor: 'rgb(var(--border))', color: 'rgb(var(--text-main))' }} />
                 <Legend />
                 <Bar yAxisId="left" dataKey="occupancy" barSize={30} fill="#3b82f6" radius={[4, 4, 0, 0]} name="People Count" />
                 <Line yAxisId="right" type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={3} dot={{r:4}} name="Energy Usage" />
               </ComposedChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Heatmap Section */}
      <div key={`heatmap-${selectedDate}`} className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-2xl p-6 shadow-lg">
         <div className="flex justify-between items-end mb-6">
            <div>
               <h3 className="text-lg font-bold text-[rgb(var(--text-main))]">Room Energy Intensity</h3>
               <p className="text-sm text-[rgb(var(--text-muted))]">Hourly usage patterns (Darker = Higher Usage)</p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-[rgb(var(--text-muted))]">
               <span>Low</span>
               <div className="flex">
                  <div className="w-4 h-4 bg-emerald-900"></div>
                  <div className="w-4 h-4 bg-emerald-700"></div>
                  <div className="w-4 h-4 bg-emerald-500"></div>
                  <div className="w-4 h-4 bg-emerald-300"></div>
                  <div className="w-4 h-4 bg-white border border-slate-300"></div>
               </div>
               <span>High</span>
            </div>
         </div>
         
         <div className="overflow-x-auto">
            <div className="min-w-[600px]">
               {/* Header Row */}
               <div className="flex mb-2">
                  <div className="w-20 shrink-0 text-sm font-bold text-[rgb(var(--text-muted))]">Room</div>
                  {Array.from({length: 12}).map((_, i) => (
                     <div key={i} className="flex-1 text-center text-xs text-[rgb(var(--text-muted))]">
                        {8 + i}:00
                     </div>
                  ))}
               </div>
               
               {/* Rows */}
               {heatmap.map((room) => (
                  <div key={room.room} className="flex items-center mb-2 group hover:bg-[rgb(var(--bg-input))]/50 rounded-lg p-1 transition-colors">
                     <div className="w-20 shrink-0 font-medium text-[rgb(var(--text-sec))]">#{room.room}</div>
                     {room.hours.map((val, i) => {
                        // Calculate color intensity
                        // 0-100 range
                        // Use opacity or specific colors
                        let bgClass = "bg-slate-800";
                        if (val > 80) bgClass = "bg-emerald-300"; // Very High
                        else if (val > 60) bgClass = "bg-emerald-400";
                        else if (val > 40) bgClass = "bg-emerald-600";
                        else if (val > 20) bgClass = "bg-emerald-800";
                        else if (val > 0) bgClass = "bg-emerald-900/50";
                        
                        return (
                           <div key={i} className="flex-1 px-1 h-8">
                              <div 
                                 className={`w-full h-full rounded-md ${bgClass} transition-all hover:scale-110 relative group/cell`}
                              >
                                 <div className="opacity-0 group-hover/cell:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-[rgb(var(--bg-card))] text-[rgb(var(--text-main))] text-[10px] px-1 py-0.5 rounded pointer-events-none z-10 whitespace-nowrap border border-[rgb(var(--border))] shadow-sm">
                                    {val}%
                                 </div>
                              </div>
                           </div>
                        )
                     })}
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Analytics;
