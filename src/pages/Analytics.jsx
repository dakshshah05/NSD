import React, { useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip,
  ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { getMockData } from '../data/mockData';
import { fetchDailyStats, checkScheduleAnomalies } from '../data/historicalData';
import { useDate } from '../context/DateContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { supabase } from '../lib/supabaseClient';
import emailjs from '@emailjs/browser';
import { AlertTriangle, TrendingUp, Info, Clock, Power, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const Analytics = () => {
  const { selectedDate } = useDate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [dayData, setDayData] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loadingAnomalies, setLoadingAnomalies] = useState(true);
  const [isReporting, setIsReporting] = useState({});

  React.useEffect(() => {
      async function load() {
          setDayData(null);
          let data = await fetchDailyStats(selectedDate);
          if (!data) data = getMockData(selectedDate); // Fallback
          setDayData(data);
      }
      load();
  }, [selectedDate]);

  React.useEffect(() => {
      async function loadAnomalies() {
          setLoadingAnomalies(true);
          const detected = await checkScheduleAnomalies();
          setAnomalies(detected);
          setLoadingAnomalies(false);
      }
      loadAnomalies();
      // Auto-refresh anomalies every minute
      const interval = setInterval(loadAnomalies, 60000);
      return () => clearInterval(interval);
  }, []);

  const handleAnomalyReport = async (anomaly) => {
      const anomalyId = anomaly.id;
      setIsReporting(prev => ({ ...prev, [anomalyId]: true }));

      try {
          // 1. Award 50 points to the user
          if (user?.id) {
              await supabase.rpc('add_green_points', { user_id: user.id, points_to_add: 50 });
          }

          // 2. Send email to admin
          const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
          const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
          const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

          if (serviceId && templateId && publicKey) {
              await emailjs.send(
                  serviceId,
                  templateId,
                  {
                      to_email: 'dakshshah215@gmail.com',
                      subject: `ANOMALY REPORT: ${anomaly.room_name}`,
                      message: `A student has reported a schedule anomaly.\n\nRoom: ${anomaly.room_name}\nType: ${anomaly.type}\nPower Draw: ${anomaly.power}W\nDetails: ${anomaly.details}\n\nReported by: ${user?.email || 'Anonymous Student'}`,
                      date: new Date().toLocaleDateString(),
                      filename: 'N/A'
                  },
                  publicKey
              );
          }

          addNotification('Report Sent', `Successfully reported anomaly in ${anomaly.room_name}. +50 points awarded!`, 'success');
      } catch (error) {
          console.error("Failed to report anomaly:", error);
          addNotification('Error', 'Failed to send report. Please try again later.', 'error');
      } finally {
          setIsReporting(prev => ({ ...prev, [anomalyId]: false }));
      }
  };

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

      {/* --- SCHEDULE ANOMALY DETECTION (AI/Timetable integration) --- */}
      <div className="bg-gradient-to-r from-slate-900 to-red-950/20 border border-[rgb(var(--border))] rounded-2xl p-6 shadow-lg relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
             <AlertTriangle size={150} />
         </div>
         <div className="relative z-10 flex items-center gap-3 mb-6">
             <div className="p-2 bg-red-500/20 rounded-lg text-red-500 animate-pulse">
                <AlertTriangle size={24} />
             </div>
             <div>
                 <h3 className="text-xl font-bold text-white">Live Schedule Anomalies</h3>
                 <p className="text-sm text-slate-400">Comparing active room power against the official daily timetable.</p>
             </div>
         </div>

         {loadingAnomalies ? (
             <div className="py-8 text-center text-slate-400 animate-pulse flex flex-col items-center">
                 <Power className="mb-2 opacity-50" size={32} />
                 Scanning campus grid for unscheduled power draw...
             </div>
         ) : anomalies.length === 0 ? (
             <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 flex items-center justify-center text-emerald-400 gap-3">
                 <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="font-medium">All clear. No unauthorized or unscheduled energy usage detected at this time.</span>
             </div>
         ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {anomalies.map((anomaly, i) => (
                     <motion.div 
                        key={anomaly.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-[rgb(var(--bg-input))] border border-red-500/30 rounded-xl p-5 hover:border-red-500/60 transition-colors relative group"
                     >
                         <div className="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-l-xl" />
                         <div className="flex justify-between items-start mb-3 ml-2">
                             <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                 {anomaly.room_name} 
                                 <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">
                                     {anomaly.type}
                                 </span>
                             </h4>
                         </div>
                         <div className="space-y-2 ml-2">
                             <div className="flex items-center text-sm text-slate-300 gap-2">
                                 <Power size={14} className="text-amber-400" />
                                 Drawing <span className="font-mono font-bold text-amber-400">{anomaly.power}W</span>
                             </div>
                             <div className="flex items-center text-sm text-slate-400 gap-2">
                                 <Clock size={14} className="text-blue-400" />
                                 {anomaly.details}
                             </div>
                         </div>
                         <button 
                            onClick={() => handleAnomalyReport(anomaly)}
                            disabled={isReporting[anomaly.id]}
                            className="mt-4 ml-2 w-full py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-sm font-medium transition-colors border border-red-500/20 hover:border-red-500 flex items-center justify-center gap-2"
                         >
                             {isReporting[anomaly.id] ? (
                                 <span className="animate-pulse">Reporting...</span>
                             ) : (
                                 <>
                                     <Send size={14} />
                                     Send report
                                 </>
                             )}
                         </button>
                      </motion.div>
                 ))}
             </div>
         )}
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
