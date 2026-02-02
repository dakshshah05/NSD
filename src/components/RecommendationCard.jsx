import React from 'react';
import { AlertTriangle, CheckCircle, Lightbulb, TrendingUp, Zap } from 'lucide-react';
import { clsx } from 'clsx';

const RecommendationCard = ({ data, onApply }) => {
  const isCritical = data.type === 'critical';
  const isWarning = data.type === 'warning';
  
  let borderColor = "border-emerald-500/30";
  let iconBg = "bg-emerald-500/20 text-[#022c22] dark:text-emerald-400";
  let priorityColor = "bg-emerald-500/20 text-[#022c22] dark:text-emerald-300";
  
  if (isCritical) {
      borderColor = "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]";
      iconBg = "bg-red-500/20 text-[#450a0a] dark:text-red-500";
      priorityColor = "bg-red-500/20 text-[#450a0a] dark:text-red-300";
  } else if (isWarning) {
      borderColor = "border-yellow-500/40";
      iconBg = "bg-yellow-500/20 text-[#422006] dark:text-yellow-500";
      priorityColor = "bg-yellow-500/20 text-[#422006] dark:text-yellow-300";
  }

  return (
    <div className={clsx(
      "bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-6 relative overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-lg", 
      borderColor
    )}>
      {/* Decorative gradient */}
      <div className={clsx(
          "absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-5 -translate-y-1/2 translate-x-1/2",
          isCritical ? "bg-red-500" : (isWarning ? "bg-yellow-500" : "bg-emerald-500")
      )} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className={clsx("p-3 rounded-xl", iconBg)}>
             {isCritical ? <AlertTriangle size={24} /> : (isWarning ? <Zap size={24} /> : <Lightbulb size={24} />)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[rgb(var(--text-main))]">{data.issue}</h3>
            <p className="text-sm text-[rgb(var(--text-muted))]">{data.room} • {data.block}</p>
          </div>
        </div>
        <span className={clsx("text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider", priorityColor)}>
           {data.priority} Priority
        </span>
      </div>

      <div className="mb-6 relative z-10">
         <div className="mb-2">
            <span className="text-xs uppercase text-[rgb(var(--text-muted))] font-semibold tracking-wide">AI Insight</span>
            <p className="text-[rgb(var(--text-sec))] text-sm mt-1">{data.insight}</p>
         </div>
         <div className="flex items-center space-x-2 text-[#064e3b] dark:text-emerald-400 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
            <TrendingUp size={16} />
            <span className="text-sm font-medium">Estimated Savings: {data.savings}</span>
         </div>
      </div>

      <button 
        onClick={() => onApply(data.id)}
        className="w-full py-3 bg-[rgb(var(--bg-input))] hover:bg-opacity-80 text-[rgb(var(--text-main))] rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 border border-[rgb(var(--border))] hover:border-emerald-500 group"
      >
        <span>Apply Recommendation</span>
        <CheckCircle size={18} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );
};

export default RecommendationCard;
