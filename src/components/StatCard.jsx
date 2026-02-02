import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { clsx } from 'clsx';

import { useTheme } from '../context/ThemeContext';

const StatCard = ({ title, value, unit, icon: Icon, trend, trendValue, gradient, invertTrend }) => {
  const { isDarkMode } = useTheme();
  const isPositive = trend === 'up';
  
  // Logic: 
  // Default: Up (Red/Bad), Down (Green/Good) -> for Consumption
  // Invert: Up (Green/Good), Down (Red/Bad) -> for Savings
  
  let trendColor = "";
  if (isPositive) {
      trendColor = invertTrend ? "text-emerald-300 bg-emerald-500/20" : "text-red-300 bg-red-500/20";
      if (!isDarkMode) {
          trendColor = invertTrend ? "text-emerald-700 bg-emerald-100 border border-emerald-200" : "text-red-700 bg-red-100 border border-red-200";
      }
  } else {
      trendColor = invertTrend ? "text-red-300 bg-red-500/20" : "text-emerald-300 bg-emerald-500/20";
      if (!isDarkMode) {
          trendColor = invertTrend ? "text-red-700 bg-red-100 border border-red-200" : "text-emerald-700 bg-emerald-100 border border-emerald-200";
      }
  }

  // In light mode, override gradient with theme colors
  const cardClass = isDarkMode 
    ? gradient 
    : "bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] shadow-sm";
    
  const textClass = isDarkMode ? "text-white" : "text-[rgb(var(--text-main))]";
  const subTextClass = isDarkMode ? "text-white/70" : "text-[rgb(var(--text-muted))]";

  return (
    <div className={clsx(
      "rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl",
      isDarkMode ? "border border-white/10" : "",
      cardClass
    )}>
      {/* Decorative Circles only for Dark Mode */}
      {isDarkMode && (
        <>
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-black/10 blur-xl"></div>
        </>
      )}

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={clsx(
            "p-3 rounded-xl backdrop-blur-sm border shadow-inner",
            isDarkMode ? "bg-white/20 border-white/10 text-white" : "bg-[rgb(var(--bg-input))] border-[rgb(var(--border))] text-emerald-600"
        )}>
          <Icon size={24} />
        </div>
        <div className={clsx("flex items-center text-xs font-bold px-2 py-1 rounded-full backdrop-blur-md", trendColor)}>
           {isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
           {trendValue}
        </div>
      </div>

      <div className="relative z-10">
        <h3 className={clsx("text-4xl font-black mb-1 tracking-tight drop-shadow-md", textClass)}>
          {value} <span className={clsx("text-lg font-medium", isDarkMode ? "text-white/80" : "text-[rgb(var(--text-muted))]")}>{unit}</span>
        </h3>
        <p className={clsx("text-sm font-semibold tracking-wide uppercase", subTextClass)}>{title}</p>
      </div>
    </div>
  );
};

export default StatCard;
