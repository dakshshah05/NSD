import React, { useState } from 'react';
import { useDate } from '../context/DateContext';
import { fetchDailyStats, fetchRoomStatus } from '../data/historicalData';
import { FileText, Download, Calendar, BarChart3, CloudRain } from 'lucide-react';
import emailjs from '@emailjs/browser';

import { useNotifications } from '../context/NotificationContext'; 
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
// ...
const Reports = () => {
  const { selectedDate } = useDate();
  const { user } = useAuth();
  
  // Debugging Context
  const notifCtx = useNotifications();
  console.log("Reports: Notification Context:", notifCtx);
  const addNotification = notifCtx?.addNotification || ((...args) => console.warn("Missing addNotification", args));

  const settingsCtx = useSettings();
  const settings = settingsCtx?.settings || {};

  const [downloading, setDownloading] = useState(null);



// ...

  const generateCSV = async (type) => {
    setDownloading(type);
    
    try {
      let csvContent = "";
      let filename = `report-${type}-${selectedDate}.csv`;

      // Fetch Data based on type
      if (type === 'daily') {
        const dayData = await fetchDailyStats(selectedDate);
        if (dayData) {
            csvContent = "Time,Energy (kWh),Predicted Occupancy\n";
            dayData.trends.forEach(t => {
                csvContent += `${t.time},${t.energy},${Math.floor(Math.random() * 100)}\n`;
            });
        }
      } else if (type === 'rooms') {
          const rooms = await fetchRoomStatus();
          csvContent = "ID,Name,Block,Status,Power (W),Energy (kWh),Lights,Fans\n";
          rooms.forEach(r => {
              csvContent += `${r.id},${r.name},${r.block_name || r.block},${r.status},${r.power},${r.energy},${r.lights ? 'ON' : 'OFF'},${r.fans ? 'ON' : 'OFF'}\n`;
          });
      } else if (type === 'wastage') {
         const dayData = await fetchDailyStats(selectedDate);
         if (dayData && dayData.wasteEvents) {
            csvContent = "Issue,Risk,Details\n";
            dayData.wasteEvents.forEach(w => {
                 csvContent += `${w.issue},${w.risk},${w.details}\n`;
            });
         }
      }
      
      if (!csvContent || csvContent.trim() === "") {
          csvContent += "No data available for the selected date on this report.\\n";
      }

      // Trigger Download (Keep existing)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Determine recipient email
      const recipientEmail = user?.email || 'dakshshah215@gmail.com';
      
      // ALWAYS NOTIFY & EMAIL
      addNotification('Sending Report', `Emailing ${filename} to ${recipientEmail}...`);
      
      try {
          // Verify env variables are present before sending
          const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
          const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
          const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

          if (!serviceId || !templateId || !publicKey) {
              addNotification('Email configuration missing', 'Please ensure all 3 EmailJS keys are in your .env file and restart the server.');
              console.warn("Missing Env vars:", { serviceId, templateId, publicKey });
              return;
          }

          // Convert CSV to Base64 Data URI for EmailJS attachment
          const base64Csv = btoa(unescape(encodeURIComponent(csvContent)));
          const csvDataUri = `data:text/csv;base64,${base64Csv}`;

          // Send via EmailJS
          await emailjs.send(
              serviceId,
              templateId,
              {
                  to_email: recipientEmail,
                  subject: `EnergyGuard Report: ${filename}`,
                  message: `You have downloaded report data for ${selectedDate}.`,
                  csv_data: csvDataUri, 
                  date: selectedDate,
                  filename: filename
              },
              publicKey
          );
          addNotification('Success', `Report ${filename} sent to email successfully!`);
      } catch (emailError) {
          console.error("Email sending failed:", emailError);
          const errorMsg = emailError?.text || emailError?.message || 'Unknown network error';
          addNotification('Email Error', `Failed: ${errorMsg}. Did you use the correct Template ID?`);
          alert(`EmailJS Error: ${errorMsg}\n\nPlease verify your Service ID, Template ID, and Public Key match exactly what is in your EmailJS dashboard.`);
      }

    } catch (e) {
        console.error("Report Generation Failed", e);
        addNotification('Error', 'Failed to generate report. Please try again.');
    } finally {
        setDownloading(null);
    }
  };




  const ReportCard = ({ title, description, icon: Icon, type, color }) => (
    <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-6 hover:shadow-lg transition-all group">
       <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-opacity-20 ${color.replace('text-', 'bg-')} ${color}`}>
             <Icon size={24} />
          </div>
          <button 
            onClick={() => generateCSV(type)}
            disabled={downloading !== null}
            className="flex items-center space-x-2 text-sm font-medium text-[rgb(var(--text-muted))] hover:text-emerald-400 disabled:opacity-50 transition-colors"
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
       <h3 className="text-lg font-bold text-[rgb(var(--text-main))] mb-2">{title}</h3>
       <p className="text-sm text-[rgb(var(--text-muted))] mb-4">{description}</p>
       <div className="text-xs text-[rgb(var(--text-sec))] font-mono bg-[rgb(var(--bg-input))] p-2 rounded border border-[rgb(var(--border))]">
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
      
      <div className="p-4 bg-[rgb(var(--bg-card))]/50 border border-[rgb(var(--border))] rounded-xl text-center text-sm text-[rgb(var(--text-muted))]">
         <p>Reports are automatically emailed to <span className="font-semibold text-[rgb(var(--text-main))]">{user?.email || 'dakshshah215@gmail.com'}</span> upon generation.</p>
      </div>
    </div>
  );
};

export default Reports;
