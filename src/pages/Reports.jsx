import React, { useState } from 'react';
import { useDate } from '../context/DateContext';
import { getMockData } from '../data/mockData';
import { FileText, Download, Calendar, BarChart3, CloudRain } from 'lucide-react';
import { clsx } from 'clsx'; // Assuming clsx is available since it's in package.json, if not I'll remove it or use template literals. Wait, I removed it from Recs page to be safe. I'll stick to template literals here to be safe and consistent.

const Reports = () => {
  const { selectedDate } = useDate();
  const [downloading, setDownloading] = useState(null);

  const generateCSV = (type) => {
    setDownloading(type);
    
    setTimeout(() => {
      const dayData = getMockData(selectedDate);
      let csvContent = "";
      let filename = `report-${type}-${selectedDate}.csv`;

      if (type === 'daily') {
        // Daily Summary: Time vs Energy vs Occupancy (simulated)
        csvContent = "Time,Energy (kWh),Predicted Occupancy\n";
        dayData.trends.forEach(t => {
            csvContent += `${t.time},${t.energy.toFixed(2)},${Math.floor(Math.random() * 100)}\n`;
        });
      } else if (type === 'rooms') {
        // Room Status Report
        csvContent = "Room ID,Name,Block,Status,Power (W),Energy (kWh),Lights,Fans\n";
        dayData.rooms.forEach(r => {
            csvContent += `${r.id},${r.name},${r.block},${r.status},${r.power},${r.energy},${r.lights ? 'ON' : 'OFF'},${r.fans ? 'ON' : 'OFF'}\n`;
        });
      } else if (type === 'wastage') {
         // Wastage Events
         csvContent = "Issue,Risk Level,Details\n";
         dayData.wasteEvents.forEach(w => {
             csvContent += `${w.issue},${w.risk},${w.details}\n`;
         });
      }

      // Trigger Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloading(null);
    }, 1000); // Simulate processing delay
  };

  const ReportCard = ({ title, description, icon: Icon, type, color }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all group">
       <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-opacity-20 ${color.replace('text-', 'bg-')} ${color}`}>
             <Icon size={24} />
          </div>
          <button 
            onClick={() => generateCSV(type)}
            disabled={downloading !== null}
            className="flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-emerald-400 disabled:opacity-50 transition-colors"
          >
             {downloading === type ? (
                 <span>Generating...</span>
             ) : (
                <>
                    <Download size={16} />
                    <span>Download CSV</span>
                </>
             )}
          </button>
       </div>
       <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
       <p className="text-sm text-slate-400 mb-4">{description}</p>
       <div className="text-xs text-slate-500 font-mono bg-slate-950 p-2 rounded border border-slate-800">
          {type === 'daily' && "fields: Time, Energy, Occupancy"}
          {type === 'rooms' && "fields: ID, Name, Status, Power..."}
          {type === 'wastage' && "fields: Issue, Risk, Details"}
       </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 p-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl border border-white/10">
         <div>
            <h1 className="text-2xl font-bold text-white mb-2">Energy Reports</h1>
            <p className="text-slate-300">Generate and download detailed analysis for <span className="text-emerald-400 font-mono font-bold">{selectedDate}</span>.</p>
         </div>
         <FileText size={48} className="text-white/20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <ReportCard 
            title="Daily Consumption Summary" 
            description="Hourly breakdown of energy usage trends and occupancy correlation."
            icon={BarChart3}
            type="daily"
            color="text-blue-400"
         />
         <ReportCard 
            title="Room Status Audit" 
            description="Detailed snapshot of every room's status, power draw, and device state."
            icon={Calendar}
            type="rooms"
            color="text-emerald-400"
         />
         <ReportCard 
            title="Wastage & Anomalies" 
            description="Log of detected inefficiencies, leakage events, and critical alerts."
            icon={CloudRain} // Just a placeholder for alerts
            type="wastage"
            color="text-amber-400"
         />
      </div>
      
      <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-center text-sm text-slate-500">
         <p>Need custom reports? Contact your System Administrator.</p>
      </div>
    </div>
  );
};

export default Reports;
