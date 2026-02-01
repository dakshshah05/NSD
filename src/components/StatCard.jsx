import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { clsx } from 'clsx';

const StatCard = ({ title, value, unit, icon: Icon, trend, trendValue, gradient, invertTrend }) => {
  const isPositive = trend === 'up';
  
  // Logic: 
  // Default: Up (Red/Bad), Down (Green/Good) -> for Consumption
  // Invert: Up (Green/Good), Down (Red/Bad) -> for Savings
  
  let trendColor = "";
  if (isPositive) {
      trendColor = invertTrend ? "text-emerald-300 bg-emerald-500/20" : "text-red-300 bg-red-500/20";
  } else {
      trendColor = invertTrend ? "text-red-300 bg-red-500/20" : "text-emerald-300 bg-emerald-500/20";
  }

  return (
    <div className={clsx(
      "rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/10",
      gradient
    )}>
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-black/10 blur-xl"></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/10 text-white shadow-inner">
          <Icon size={24} />
        </div>
        <div className={clsx("flex items-center text-xs font-bold px-2 py-1 rounded-full backdrop-blur-md border border-white/10", trendColor)}>
           {isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
           {trendValue}
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="text-4xl font-black text-white mb-1 tracking-tight drop-shadow-md">
          {value} <span className="text-lg font-medium text-white/80">{unit}</span>
        </h3>
        <p className="text-white/70 text-sm font-semibold tracking-wide uppercase">{title}</p>
      </div>
    </div>
  );
};

export default StatCard;
