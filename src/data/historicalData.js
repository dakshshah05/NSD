import { supabase } from '../lib/supabaseClient';
import { generateHistoricalData } from './dataGenerator';

// --- HELPER FOR DATE FORMATTING ---
const formatDateKey = (date) => date.toISOString().split('T')[0];
const todayKey = formatDateKey(new Date());

// --- HELPER GEN LOGIC ---
const generateUsageBreakdown = (scenarioType) => {
    let baseBreakdown = [65, 20, 15]; 
    if (scenarioType === 'HIGH_LOAD') baseBreakdown = [50, 15, 35];
    else if (scenarioType === 'WEEKEND') baseBreakdown = [30, 60, 10];
    else if (scenarioType === 'LEAKAGE') baseBreakdown = [60, 10, 30];

    const variance1 = Math.floor(Math.random() * 6) - 3;
    const variance2 = Math.floor(Math.random() * 6) - 3;
    const finalBreakdown = [
        Math.max(0, baseBreakdown[0] + variance1),
        Math.max(0, baseBreakdown[1] + variance2),
        Math.max(0, 100 - (baseBreakdown[0] + variance1) - (baseBreakdown[1] + variance2))
    ];

    return [
        { name: 'Productive Usage', value: finalBreakdown[0], color: '#10b981' }, 
        { name: 'Idle Usage', value: finalBreakdown[1], color: '#f59e0b' },
        { name: 'Wastage', value: finalBreakdown[2], color: '#ef4444' },
    ];
};

const generateHeatmap = (scenarioType) => {
    return [
        { room: '101', hours: Array.from({length: 12}, () => Math.floor(Math.random() * (scenarioType === 'WEEKEND' ? 30 : 100))) },
        { room: '102', hours: Array.from({length: 12}, () => Math.floor(Math.random() * (scenarioType === 'HIGH_LOAD' ? 100 : 80))) },
        { room: 'Lab', hours: Array.from({length: 12}, () => Math.floor(Math.random() * (scenarioType === 'LEAKAGE' ? 90 : 60))) }, 
        { room: '301', hours: Array.from({length: 12}, () => Math.floor(Math.random() * 90)) }, 
        { room: '401', hours: Array.from({length: 12}, () => Math.floor(Math.random() * 40)) }, 
    ];
};

// --- FETCH FUNCTIONS ---

export const fetchDailyStats = async (dateKey) => {
    try {
        console.log(`Fetching stats for ${dateKey}`);
        // Try to get from Supabase
        const { data, error } = await supabase
            .from('daily_stats')
            .select(`
                *,
                hourly_trends(time, energy),
                block_consumption(block_name, consumption),
                waste_events(issue, risk, details)
            `)
            .eq('date', dateKey)
            .maybeSingle(); 

        if (error) {
            console.warn(`Supabase fetch error for ${dateKey}`, error);
            return null;
        }

        if (!data || !data.total_consumption) {
             console.log(`No data or zero consumption for ${dateKey}, falling back.`);
             return null;
        }

        // Format to match original structure
        // Safety check for arrays
        const trends = Array.isArray(data.hourly_trends) ? data.hourly_trends.map(t => ({...t, energy: t.energy})) : [];
        const blocks = Array.isArray(data.block_consumption) ? data.block_consumption.map(b => ({ block: b.block_name, consumption: b.consumption })) : [];
        const wasteEvents = data.waste_events || [];

        const scenario = data.scenario || 'NORMAL';

        return {
            date: data.date,
            scenario: scenario,
            totalConsumption: data.total_consumption ?? 0, // Default to 0 if null
            trends,
            blocks,
            wasteEvents,
            usageBreakdown: generateUsageBreakdown(scenario),
            heatmap: generateHeatmap(scenario)
        };
    } catch (e) {
        console.error("Critical error in fetchDailyStats", e);
        return null; // Return null so components fallback to mock
    }
};

export const fetchRoomStatus = async () => {
    try {
        const { data, error } = await supabase.from('room_status').select('*');
        if(error) {
            console.error("Room fetch error", error);
            return [];
        }
        return data || [];
    } catch (e) {
        console.error("fetchRoomStatus crashed", e);
        return [];
    }
};

export const fetchRecommendations = async () => {
    try {
        const { data, error } = await supabase.from('recommendations').select('*');
        if(error) {
             console.error("Recommendations fetch error", error);
             return [];
        }
        return data || [];
    } catch (e) {
        console.error("fetchRecommendations crashed", e);
        return [];
    }
}

// --- ANOMALY DETECTION ---
export const checkScheduleAnomalies = async () => {
    try {
        // 1. Fetch current live room status
        const rooms = await fetchRoomStatus();
        
        // 2. Fetch today's timetable
        const dayOfWeek = (new Date()).getDay(); // 0(Sun) - 6(Sat)
        const { data: schedule, error } = await supabase
            .from('timetable')
            .select('*')
            .eq('day_of_week', dayOfWeek);
            
        if (error) {
            console.error("Timetable fetch error", error);
            return [];
        }

        const anomalies = [];
        
        // Current Time Format HH:MM:SS
        const now = new Date();
        const currentTimeString = now.toTimeString().split(' ')[0];

        // 3. Analyze each room
        rooms.forEach(room => {
            // Only care if the room is drawing significant power (e.g. lights/AC left on)
            // Let's say anything over 50W means something is actively left on
            if (room.power > 50) {
                
                // Find all classes scheduled in this room today
                const roomClasses = schedule.filter(s => s.room_id === room.id);
                
                // Is a class currently happening?
                const isClassOngoing = roomClasses.some(cls => {
                    return currentTimeString >= cls.start_time && currentTimeString <= cls.end_time;
                });

                // If no class is ongoing, we have an anomaly!
                if (!isClassOngoing) {
                    // Try to figure out if a class just ended
                    const pastClasses = roomClasses.filter(cls => currentTimeString > cls.end_time)
                                                   .sort((a,b) => b.end_time.localeCompare(a.end_time)); // Latest first
                    
                    let details = "No scheduled classes.";
                    if (pastClasses.length > 0) {
                        const lastClass = pastClasses[0];
                        details = `After ${lastClass.course_name}. Ended at ${lastClass.end_time.slice(0,5)}.`;
                    } else if (roomClasses.length > 0) {
                         const nextClass = roomClasses.find(cls => currentTimeString < cls.start_time);
                         if(nextClass) details = `Before ${nextClass.course_name} (Starts at ${nextClass.start_time.slice(0,5)}).`;
                    }

                    anomalies.push({
                        id: `anomaly_${room.id}_${Date.now()}`,
                        room_id: room.id,
                        room_name: room.name,
                        power: room.power,
                        details: details,
                        type: 'Unscheduled Usage'
                    });
                }
            }
        });

        return anomalies;

    } catch (e) {
        console.error("Anomaly Detection crashed", e);
        return [];
    }
};

// --- LEGACY EXPORTS (Restored for Backward Compatibility) ---
// Use defensive generation to prevent module-level crashes

export { generateHistoricalData };

let legacyData = {};
try {
    // Wrap in try-catch to prevent app crash if generator fails
    legacyData = generateHistoricalData() || {};
} catch (e) {
    console.error("generateHistoricalData crashed during module calc", e);
}

export const historicalData = legacyData;

const defaultData = { trends: [], blocks: [] };
// Ensure we always export a valid object structure, even if empty
export const currentDayData = (legacyData && (legacyData[todayKey] || Object.values(legacyData)[0])) || defaultData;

// Fallback exports for existing components
export const energyTrendData = currentDayData.trends || [];
export const blockConsumptionData = currentDayData.blocks || [];
