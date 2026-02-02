import React from 'react';
import { Lightbulb, Fan, Bot, Power } from 'lucide-react';
import { clsx } from 'clsx';

const Toggle = ({ enabled, onChange, disabled }) => (
  <button
    onClick={() => !disabled && onChange(!enabled)}
    className={clsx(
      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900",
      enabled ? (disabled ? "bg-emerald-600/50" : "bg-emerald-500") : "bg-[rgb(var(--text-muted))]",
      disabled && "cursor-not-allowed opacity-70"
    )}
  >
    <span
      className={clsx(
        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
        enabled ? "translate-x-6" : "translate-x-1"
      )}
    />
  </button>
);

const ControlCard = ({ room, onUpdate }) => {
  const isAutomationOn = room.automation ?? true;

  const handleToggle = (type) => {
    let updates = {};
    if (type === 'automation') {
       updates = { automation: !isAutomationOn };
    } else if (type === 'lights') {
       updates = { lights: !room.lights };
    } else if (type === 'fans') {
       updates = { fans: !room.fans };
    }
    onUpdate(room.id, updates);
  };

  return (
    <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-[rgb(var(--text-main))]">{room.name}</h3>
          <p className="text-sm text-[rgb(var(--text-muted))]">{room.block}</p>
        </div>
        <div className={clsx(
            "p-2 rounded-lg transition-colors",
            isAutomationOn ? "bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.2)]" : "bg-[rgb(var(--bg-input))] text-[rgb(var(--text-muted))]"
        )}>
            <Bot size={20} />
        </div>
      </div>

      <div className="space-y-4">
        {/* Automation Main Toggle */}
        <div className="flex items-center justify-between p-3 bg-[rgb(var(--bg-input))]/50 rounded-lg border border-[rgb(var(--border))]">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500/20 p-1.5 rounded-md text-emerald-400">
               <Bot size={16} />
            </div>
            <div>
               <p className="text-sm font-medium text-[rgb(var(--text-main))]">Smart Automation</p>
               <p className="text-[10px] text-[rgb(var(--text-muted))]">AI optimizes controls</p>
            </div>
          </div>
          <Toggle enabled={isAutomationOn} onChange={() => handleToggle('automation')} />
        </div>

        <div className="h-px bg-[rgb(var(--border))] my-2"></div>

        {/* Lights Control */}
        <div className={clsx("flex items-center justify-between transition-opacity", isAutomationOn && "opacity-50")}>
          <div className="flex items-center space-x-3">
             <Lightbulb size={18} className={room.lights ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "text-[rgb(var(--text-muted))]"} />
             <span className="text-sm text-[rgb(var(--text-sec))]">Lights</span>
          </div>
          <Toggle 
            enabled={room.lights} 
            onChange={() => handleToggle('lights')} 
            disabled={isAutomationOn} 
          />
        </div>

        {/* Fans Control */}
        <div className={clsx("flex items-center justify-between transition-opacity", isAutomationOn && "opacity-50")}>
          <div className="flex items-center space-x-3">
             <Fan size={18} className={room.fans ? "text-cyan-400 animate-spin-slow drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "text-[rgb(var(--text-muted))]"} />
             <span className="text-sm text-[rgb(var(--text-sec))]">Fans</span>
          </div>
          <Toggle 
            enabled={room.fans} 
            onChange={() => handleToggle('fans')} 
            disabled={isAutomationOn} 
          />
        </div>
      </div>
    </div>
  );
};

export default ControlCard;
