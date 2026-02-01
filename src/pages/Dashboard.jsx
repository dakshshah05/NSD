import React, { useState, useRef, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';
import { Zap, Home, TrendingDown, AlertTriangle } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import StatCard from '../components/StatCard';
import { historicalData } from '../data/mockData';
import { useDate } from '../context/DateContext';

gsap.registerPlugin(useGSAP);

const Dashboard = () => {
  const containerRef = useRef(null);
  const { selectedDate } = useDate();
  const dayData = historicalData[selectedDate] || Object.values(historicalData)[0];
  
  const [stats, setStats] = useState({
    consumption: dayData.totalConsumption,
    activeRooms: 45,
    savedEnergy: 18.5
  });

  useEffect(() => {
    // Update stats whenever dayData changes (i.e. date changes)
    setStats({
        consumption: dayData.totalConsumption,
        activeRooms: dayData.scenario === 'WEEKEND' ? 12 : 85 + Math.floor(Math.random()*10),
        savedEnergy: +(10 + Math.random() * 8).toFixed(1)
    });
  }, [dayData]);

  // Derived data for charts
  const energyTrendData = dayData.trends;
  const blockConsumptionData = dayData.blocks;

  useGSAP(() => {
     const tl = gsap.timeline();
     tl.fromTo(".gsap-stat-card", 
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out"
        }
     )
     .fromTo(".gsap-chart", 
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out"
        }, "-=0.4");
  }, { scope: containerRef, dependencies: [selectedDate] }); // Re-animate on date switch? Maybe too distracting. Let's keep one-time or subtle.
  // Actually, re-animating on date change is cool.

  // No separate interval needed for mock simulation if we are driving by date selection, 
  // but we can keep a small "live" jitter if it's the current date. 
  // For now, let's keep it simple and static per day.

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
            value={dayData.blocks.reduce((max, block) => max.consumption > block.consumption ? max : block).block}
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
        <div className="gsap-chart bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-4">Energy Consumption Trend <span className="text-slate-500 text-sm font-normal">({selectedDate})</span></h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart key={selectedDate} data={energyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
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
        <div className="gsap-chart bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-4">Consumption by Block <span className="text-slate-500 text-sm font-normal">({dayData.scenario.replace('_', ' ')})</span></h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart key={selectedDate} data={blockConsumptionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="block" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
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
