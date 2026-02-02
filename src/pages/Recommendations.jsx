import React, { useState } from 'react';
import { recommendationsData, getMockData } from '../data/mockData';
import RecommendationCard from '../components/RecommendationCard';
import { Sparkles, Check, RefreshCw, Loader2, Calendar } from 'lucide-react';
import { analyzeEnergyData } from '../services/gemini';
import { useNotifications } from '../context/NotificationContext';
import { useDate } from '../context/DateContext';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState(recommendationsData);
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [toast, setToast] = useState(null);
  
  const { selectedDate } = useDate();
  const { addNotification } = useNotifications();

  const handleApply = (id) => {
    const rec = recommendations.find(r => r.id === id);
    if (!rec) return;
    
    // Global Notification
    addNotification('Fix Applied', `Optimized ${rec.issue} for ${rec.savings} savings.`);
    
    setToast(`Applied fix for: ${rec.title || rec.issue}`);
    setRecommendations(prev => prev.filter(r => r.id !== id));
    setTimeout(() => setToast(null), 3000);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setToast(`Analyzing data for ${selectedDate}...`);
    
    try {
        // Get context for specific date safely
        const dayData = getMockData(selectedDate);
        
        // Prepare context
        const context = {
            date: selectedDate,
            totalConsumption: dayData?.totalConsumption || 0,
            trends: dayData?.trends || [],
            blocks: dayData?.blocks || [],
            knownIssues: dayData?.wasteEvents || []
        };

        const result = await analyzeEnergyData(context);
        
        if (result && result.recommendations) {
            const mappedRecs = result.recommendations.map(r => ({
                id: r.id || Math.random(),
                issue: r.title,
                insight: r.description,
                recommendation: r.action || "Apply Fix",
                savings: r.savings,
                priority: r.priority,
                type: r.priority === 'High' ? 'critical' : 'warning',
                room: 'System Wide', // Default since API doesn't return room
                block: 'General'     // Default
            }));

            setRecommendations(mappedRecs);
            setAiSummary(result.summary);
            setToast("Analysis Complete!");
        } else {
            setToast("Analysis returned no results.");
        }
    } catch (error) {
        console.error("Analysis Error:", error);
        setToast("Analysis failed. See console.");
    }
    
    setLoading(false);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6 min-h-[80vh]">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 border border-slate-700 text-white px-6 py-3 rounded-lg shadow-xl flex items-center space-x-3 z-50 animate-bounce">
           {loading ? <Loader2 className="animate-spin text-emerald-400" size={20} /> : <Check className="text-emerald-400" size={20} />}
           <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
         <div className="relative z-10 max-w-4xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Sparkles size={24} className="text-yellow-300" />
                    </div>
                    <h2 className="text-2xl font-bold">AI Optimization Engine</h2>
                    </div>
                    <p className="text-indigo-100 text-lg leading-relaxed mb-6 max-w-xl">
                    {aiSummary || "Our AI analyzes patterns in real-time to identify energy wastage. Select a date to analyze historical performance."}
                    </p>
                </div>

                {/* Controls Area */}
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex flex-col space-y-4 min-w-[200px] justify-center">
                    <button 
                        onClick={handleAnalyze}
                        disabled={loading}
                        className={`flex items-center justify-center px-6 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 ${loading ? "bg-indigo-400 cursor-wait" : "bg-white text-indigo-600 hover:bg-indigo-50"}`}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin mr-2" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <RefreshCw size={20} className="mr-2" />
                                Run Analysis
                            </>
                        )}
                    </button>
                </div>
            </div>
            
         </div>
      </div>

      {/* Recommendations Grid */}
      <h3 className="text-xl font-bold text-white flex items-center">
        <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm mr-3 border border-emerald-500/20">
            Insights for {selectedDate}
        </span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {recommendations.length > 0 ? (
            recommendations.map(rec => (
               <RecommendationCard key={rec.id} data={rec} onApply={handleApply} />
            ))
         ) : (
            <div className="col-span-full py-20 text-center bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
               <Sparkles size={48} className="mx-auto text-slate-600 mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">All Optimized!</h3>
               <p className="text-slate-400">No new recommendations available at this time.</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default Recommendations;
