import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { getMockData } from "../data/mockData";
import {
  fetchDailyStats,
  checkScheduleAnomalies,
} from "../data/historicalData";
import { useDate } from "../context/DateContext";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { supabase } from "../lib/supabaseClient";
import emailjs from "@emailjs/browser";
import {
  AlertTriangle,
  TrendingUp,
  Info,
  Clock,
  Power,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";

const Analytics = () => {
  const { selectedDate } = useDate();
  const { user, role } = useAuth();
  const { addNotification } = useNotifications();
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

  if (!dayData)
    return (
      <div className="p-10 text-center opacity-50">Loading Analytics...</div>
    );

  // Dynamic Data
  const usageBreakdown = dayData.usageBreakdown || [
    { name: "Productive", value: 70, color: "#10b981" },
    { name: "Idle", value: 20, color: "#f59e0b" },
    { name: "Wastage", value: 10, color: "#ef4444" },
  ];

  const heatmap = dayData.heatmap || [];

  // Transform dayData.trends for the ComposedChart
  // We need to simulate 'occupancy' based on the scenario
  const getOccupancy = (hour) => {
    const isWeekend = dayData.scenario === "WEEKEND";
    const isNight = hour < 8 || hour > 20;

    if (isWeekend) return isNight ? 10 : 30; // Low occupancy on weekends
    if (isNight) return 20; // Some hostel/lab activity
    return 85 + Math.random() * 15; // High occupancy
  };

  const occupancyVsEnergy = dayData.trends.map((t) => {
    const hour = parseInt(t.time.split(":")[0]);
    return {
      time: t.time,
      energy: t.energy,
      occupancy: Math.floor(getOccupancy(hour)),
    };
  });

  // Forecasting Data (Mocked Time Series Prediction)
  const [forecastRange, setForecastRange] = useState("day");

  const generateForecast = (range) => {
    const data = [];
    const baseEnergy = dayData.totalConsumption / 24; // Average hourly
    const now = new Date();

    if (range === "hour") {
      // Next 60 mins (minute by minute mock)
      for (let i = 1; i <= 6; i++) {
        const time = new Date(
          now.getTime() + i * 10 * 60000,
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        // Add some noise and a trend
        const predicted = baseEnergy * 0.1 + i * 2 + (Math.random() * 10 - 5);
        data.push({
          time,
          actual: i === 1 ? predicted : null,
          predicted: parseInt(predicted),
        });
      }
    } else if (range === "day") {
      // Next 24 hours
      for (let i = 1; i <= 24; i += 4) {
        const time = new Date(now.getTime() + i * 3600000).toLocaleTimeString(
          [],
          { hour: "2-digit", minute: "2-digit" },
        );
        // Peak during day, low at night mock
        const hour = new Date(now.getTime() + i * 3600000).getHours();
        const multiplier = hour > 8 && hour < 18 ? 1.5 : 0.5;
        const predicted = baseEnergy * multiplier + (Math.random() * 20 - 10);
        data.push({ time, predicted: parseInt(predicted) });
      }
    } else if (range === "week") {
      // Next 7 days
      for (let i = 1; i <= 7; i++) {
        const d = new Date(now.getTime() + i * 86400000);
        const time = d.toLocaleDateString([], { weekday: "short" });
        // Weekend drop mock
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
        const multiplier = isWeekend ? 0.6 : 1.1;
        const predicted =
          dayData.totalConsumption * multiplier + (Math.random() * 500 - 250);
        data.push({ time, predicted: parseInt(predicted) });
      }
    }
    return data;
  };

  const forecastData = generateForecast(forecastRange);

  return (
    <div className="space-y-6 animate-fade-in overflow-hidden">
      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wastage Pie Chart */}
        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-2xl p-6 shadow-lg lg:col-span-1 min-h-[400px] overflow-hidden">
          <h3 className="text-lg font-bold text-[rgb(var(--text-main))] mb-2 text-center lg:text-left">
            Energy Efficiency
          </h3>
          <p className="text-xs text-[rgb(var(--text-muted))] mb-6 text-center lg:text-left">
            Breakdown of power usage types
          </p>
          <div className="overflow-x-auto lg:overflow-hidden scrollbar-hide">
            <div className="h-80 w-[400px] lg:w-full relative mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={usageBreakdown}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {usageBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <ReTooltip
                    formatter={(value) => [`${value}%`, "Usage"]}
                    contentStyle={{
                      backgroundColor: "rgb(var(--bg-card))",
                      borderColor: "rgb(var(--border))",
                      borderRadius: "8px",
                      color: "rgb(var(--text-main))",
                    }}
                    itemStyle={{ color: "rgb(var(--text-main))" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={40}
                    wrapperStyle={{ paddingTop: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-3xl font-bold text-[rgb(var(--text-main))]">
                  {usageBreakdown[0].value}%
                </span>
                <p className="text-xs text-[rgb(var(--text-muted))]">
                  Efficient
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Occupancy vs Energy */}
        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-2xl p-4 md:p-6 shadow-lg lg:col-span-2 overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div className="max-w-[60%]">
              <h3 className="text-base md:text-lg font-bold text-[rgb(var(--text-main))] truncate">
                Occupancy vs. Energy
              </h3>
              <p className="text-[10px] md:text-xs text-[rgb(var(--text-muted))]">
                Correlation for {selectedDate}
              </p>
            </div>
            <div className="bg-[rgb(var(--bg-input))] px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs text-emerald-400 border border-[rgb(var(--border))] whitespace-nowrap">
              {(dayData.totalConsumption || 0).toLocaleString()} kWh
            </div>
          </div>

          <div className="overflow-x-auto lg:overflow-hidden scrollbar-hide pb-2">
            <div className="h-64 md:h-72 w-[700px] lg:w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  key={`composed-${selectedDate}`}
                  data={occupancyVsEnergy}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="rgb(var(--border))"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    stroke="rgb(var(--text-muted))"
                    tick={{ fontSize: 10 }}
                    interval={0}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="rgb(var(--text-muted))"
                    tick={{ fontSize: 10 }}
                    allowDecimals={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#10b981"
                    tick={{ fontSize: 10 }}
                    hide={window.innerWidth < 640}
                  />
                  <ReTooltip
                    formatter={(value) => [
                      typeof value === "number" ? value.toFixed(1) : value,
                      "",
                    ]}
                    contentStyle={{
                      backgroundColor: "rgb(var(--bg-card))",
                      borderColor: "rgb(var(--border))",
                      color: "rgb(var(--text-main))",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "10px" }} />
                  <Bar
                    yAxisId="left"
                    dataKey="occupancy"
                    barSize={20}
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    name="People"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="energy"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    name="Energy"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Section */}
      <div
        key={`heatmap-${selectedDate}`}
        className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-2xl p-6 shadow-lg"
      >
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-lg font-bold text-[rgb(var(--text-main))]">
              Room Energy Intensity
            </h3>
            <p className="text-sm text-[rgb(var(--text-muted))]">
              Hourly usage patterns (Darker = Higher Usage)
            </p>
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

        <div className="overflow-x-auto lg:overflow-hidden scrollbar-hide">
          <div className="w-[800px] lg:w-full">
            {/* Header Row */}
            <div className="flex mb-2">
              <div className="w-20 shrink-0 text-sm font-bold text-[rgb(var(--text-muted))]">
                Room
              </div>
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 text-center text-xs text-[rgb(var(--text-muted))]"
                >
                  {8 + i}:00
                </div>
              ))}
            </div>

            {/* Rows */}
            {heatmap.map((room) => (
              <div
                key={room.room}
                className="flex items-center mb-2 group hover:bg-[rgb(var(--bg-input))]/50 rounded-lg p-1 transition-colors"
              >
                <div className="w-20 shrink-0 font-medium text-[rgb(var(--text-sec))]">
                  #{room.room}
                </div>
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
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Forecasting Section */}
      <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-[rgb(var(--text-main))]">
                Energy Forecast (AI Predicted)
              </h3>
            </div>
            <p className="text-sm text-[rgb(var(--text-muted))]">
              Estimated future consumption based on historical patterns
            </p>
          </div>

          <div className="flex bg-[rgb(var(--bg-input))] rounded-lg p-1 border border-[rgb(var(--border))]">
            {["hour", "day", "week"].map((range) => (
              <button
                key={range}
                onClick={() => setForecastRange(range)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  forecastRange === range
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-main))]"
                }`}
              >
                Next {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={forecastData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="rgb(var(--border))"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                stroke="rgb(var(--text-muted))"
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="rgb(var(--text-muted))" tick={{ fontSize: 12 }} />
              <ReTooltip
                contentStyle={{
                  backgroundColor: "rgb(var(--bg-card))",
                  borderColor: "rgb(var(--border))",
                  color: "rgb(var(--text-main))",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#818cf8" }}
                formatter={(value) => [`${value} kWh`, "Predicted"]}
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#818cf8"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorPredicted)"
              />
              {forecastRange === "hour" && (
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  strokeDasharray="5 5"
                  name="Actual (so far)"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
