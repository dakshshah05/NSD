import React, { useState, useRef, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';
import { Zap, Home, TrendingDown, AlertTriangle } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import StatCard from '../components/StatCard';
import { getMockData } from '../data/mockData';
import { fetchDailyStats } from '../data/historicalData';
import { useDate } from '../context/DateContext';

gsap.registerPlugin(useGSAP);

const Dashboard = () => {
  const containerRef = useRef(null);
  const { selectedDate } = useDate();
  
  const [dayData, setDayData] = useState(null);
  const [stats, setStats] = useState({
    consumption: 0,
    activeRooms: 0,
    savedEnergy: 0
  });

  useEffect(() => {
    async function loadData() {
        setDayData(null); // Reset / Loading state
        try {
            // Try Supabase first
            let data = await fetchDailyStats(selectedDate);
            
            // Fallback to mock if missing (or error handled in fetchDailyStats returning null)
            if (!data) {
                console.log("Using fallback mock data for", selectedDate);
                data = getMockData(selectedDate);
            }

            if (data) {
                setDayData(data);
                setStats({
                    consumption: data.totalConsumption || 0,
                    activeRooms: data.scenario === 'WEEKEND' ? 12 : 85 + Math.floor(Math.random()*10),
                    savedEnergy: +(10 + Math.random() * 8).toFixed(1)
                });
            } else {
                 console.error("No data available for date:", selectedDate);
                 // Keep loading or show error? For now, dayData check handles return null.
                 // We can force error boundary if critical.
            }
        } catch (err) {
            console.error("Dashboard load error", err);
            setDayData(getMockData(selectedDate)); // Safety net
        }
    }
    loadData();
  }, [selectedDate]);

  // Derived data for charts
  const energyTrendData = dayData?.trends || [];
  const blockConsumptionData = dayData?.blocks || [];

  useGSAP(() => {
     if (!dayData || !containerRef.current) return; 
     
     // Ensure elements exist before animating
     const cards = containerRef.current.querySelectorAll('.gsap-stat-card');
     const charts = containerRef.current.querySelectorAll('.gsap-chart');
     
     if (cards.length === 0 && charts.length === 0) return;

     const tl = gsap.timeline();
     
     if (cards.length > 0) {
         tl.fromTo(cards, 
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.1,
              ease: "power3.out"
            }
         );
     }
// ... keeping rest of animation logic implicitly via if(!dayData) check above effectively, 
// but we need to return early if loading.

     if (charts.length > 0) {
         tl.fromTo(charts, 
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.2,
              ease: "power2.out" /* , delay: 0 */ // Removing relative delay if cards didn't run? 
            }, cards.length > 0 ? "-=0.4" : 0);
     }
  }, { scope: containerRef, dependencies: [dayData, selectedDate] });
  // Actually, re-animating on date change is cool.

  // No separate interval needed for mock simulation if we are driving by date selection, 
  // but we can keep a small "live" jitter if it's the current date. 
  // For now, let's keep it simple and static per day.

  if (!dayData) {
      return (
          <div className="flex items-center justify-center h-96">
              <div className="text-[rgb(var(--text-muted))] animate-pulse">Loading Energy Data...</div>
          </div>
      );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="gsap-stat-card">
          <StatCard 
            title="Total Consumption" 
            value={stats.consumption.toLocaleString()} 
            unit="kWh"
            icon={Zap}
            trend="up"
            trendValue="12%"
            gradient="bg-gradient-to-br from-blue-600 to-indigo-700"
          />
        </div>
        <div className="gsap-stat-card">
          <StatCard 
            title="Active Rooms" 
            value={stats.activeRooms} 
            unit="/ 120"
            icon={Home}
            trend="down"
            trendValue="5"
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
        </div>
        <div className="gsap-stat-card">
          <StatCard 
            title="Energy Saved Today" 
            value={stats.savedEnergy} 
            unit="%"
            icon={TrendingDown}
            trend="down"
            trendValue="2.4%"
            gradient="bg-gradient-to-br from-violet-600 to-purple-700"
            invertTrend={true}
          />
        </div>
        <div className="gsap-stat-card">
          <StatCard 
            title="Highest Consuming" 
            value={dayData.blocks.length > 0 ? dayData.blocks.reduce((max, block) => max.consumption > block.consumption ? max : block).block : "N/A"}
            unit=""
            icon={AlertTriangle}
            trend="up"
            trendValue="8%"
            gradient="bg-gradient-to-br from-orange-500 to-red-600"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        {/* Line Chart */}
        <div className="gsap-chart bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-[rgb(var(--text-main))] mb-4">Energy Consumption Trend <span className="text-[rgb(var(--text-muted))] text-sm font-normal">({selectedDate})</span></h3>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart key={selectedDate} data={energyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                <XAxis dataKey="time" stroke="rgb(var(--text-muted))" />
                <YAxis stroke="rgb(var(--text-muted))" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgb(var(--bg-card))', borderColor: 'rgb(var(--border))', color: 'rgb(var(--text-main))' }}
                  itemStyle={{ color: 'rgb(var(--text-main))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="energy" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="gsap-chart bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-[rgb(var(--text-main))] mb-4">Consumption by Block <span className="text-[rgb(var(--text-muted))] text-sm font-normal">({(dayData.scenario || '').replace('_', ' ')})</span></h3>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart key={selectedDate} data={blockConsumptionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                <XAxis dataKey="block" stroke="rgb(var(--text-muted))" interval={0} tick={{ fontSize: 12 }} />
                <YAxis stroke="rgb(var(--text-muted))" />
                <Tooltip 
                  cursor={{ fill: 'rgb(var(--bg-input))', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: 'rgb(var(--bg-card))', borderColor: 'rgb(var(--border))', color: 'rgb(var(--text-main))' }}
                />
                <Bar dataKey="consumption" radius={[6, 6, 0, 0]}>
                  {blockConsumptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
