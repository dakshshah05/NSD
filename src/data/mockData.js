// --- 30-Day Historical Data Generator ---

const generateRooms = (scenario) => {
    const baseRooms = [
        { id: 101, name: 'Lec Hall 101', block: 'Block A' },
        { id: 102, name: 'Lec Hall 102', block: 'Block A' },
        { id: 103, name: 'Comp Lab', block: 'Block B' },
        { id: 201, name: 'Chemistry Lab', block: 'Block C' },
        { id: 301, name: 'Room 301', block: 'Boys Hostel' },
        { id: 302, name: 'Room 302', block: 'Boys Hostel' },
        { id: 401, name: 'Room 401', block: 'Girls Hostel' },
        { id: 402, name: 'Common Area', block: 'Girls Hostel' },
    ];

    return baseRooms.map(room => {
        let status = 'vacant';
        let lights = false;
        let fans = false;
        let power = 0;
        
        // Logic based on scenario
        if (scenario === 'WEEKEND') {
             // Mostly vacant, but hostels occupied
             if (room.block.includes('Hostel')) {
                 status = Math.random() > 0.3 ? 'occupied' : 'vacant';
                 lights = status === 'occupied' || Math.random() > 0.9; // 10% chance left on
                 fans = status === 'occupied';
                 power = status === 'occupied' ? 150 + Math.random() * 200 : (lights ? 40 : 0);
             } else {
                 status = Math.random() > 0.9 ? 'occupied' : 'vacant'; // Rare
                 lights = status === 'occupied' || Math.random() > 0.8; // Waste
                 fans = false;
                 power = lights ? 50 : 0;
             }
        } else if (scenario === 'HIGH_LOAD') {
            status = Math.random() > 0.2 ? 'occupied' : 'vacant';
            lights = true;
            fans = true;
            power = status === 'occupied' ? 500 + Math.random() * 400 : (Math.random() > 0.5 ? 200 : 0); // High waste
        } else {
            // Normal
            status = Math.random() > 0.4 ? 'occupied' : 'vacant';
            lights = status === 'occupied';
            fans = status === 'occupied';
            power = status === 'occupied' ? 200 + Math.random() * 300 : 0;
        }

        return {
            ...room,
            status,
            lights,
            fans,
            power: Math.floor(power),
            energy: +(power / 1000 * 8).toFixed(1), // Rough kWh for 8hrs
            warning: status === 'vacant' && (lights || fans)
        };
    });
};

export const generateHistoricalData = () => {
    const data = {};
    const today = new Date();
    
    const scenarios = [
      { type: 'NORMAL', base: 12000, label: 'Standard Operation' },
      { type: 'HIGH_LOAD', base: 22000, label: 'Heatwave / High Demand' }, // Boosted base
      { type: 'WEEKEND', base: 6000, label: 'Weekend / Holiday' },      // Lowered base
      { type: 'LEAKAGE', base: 15000, label: 'Equipment Malfunction' },
      { type: 'EVENT', base: 18000, label: 'Campus Festival' }
    ];
  
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        
        let scenario = scenarios[0];
        const rand = Math.random();
        if (date.getDay() === 0 || date.getDay() === 6) scenario = scenarios[2]; 
        else if (rand > 0.85) scenario = scenarios[1]; 
        else if (rand > 0.7) scenario = scenarios[3]; 
        
        const dailyConsumption = Math.floor(scenario.base + Math.random() * 2000);
        
        // Distinct Trends
        let trendCurve = [];
        if (scenario.type === 'WEEKEND') {
            trendCurve = [60, 50, 80, 120, 110, 150, 180]; // Low, peaks at night
        } else if (scenario.type === 'HIGH_LOAD') {
            trendCurve = [200, 180, 800, 1600, 1500, 1100, 600]; // Massive noon spike
        } else {
            trendCurve = [120, 80, 450, 980, 850, 600, 300]; // Standard Bell
        }
        
        const trends = [
            { time: '00:00', energy: trendCurve[0] + Math.random()*50 },
            { time: '04:00', energy: trendCurve[1] + Math.random()*50 },
            { time: '08:00', energy: trendCurve[2] + Math.random()*100 },
            { time: '12:00', energy: trendCurve[3] + Math.random()*200 },
            { time: '16:00', energy: trendCurve[4] + Math.random()*150 },
            { time: '20:00', energy: trendCurve[5] + Math.random()*100 },
            { time: '23:59', energy: trendCurve[6] + Math.random()*50 },
        ];

        const wasteEvents = [];
        // ... (Keep existing wasteEvents logic or simplify for brevity if mostly preserved)
        // Re-injecting simple waste logic for context completeness since replacing whole block
         if (scenario.type === 'HIGH_LOAD') {
            wasteEvents.push({ issue: "HVAC System Overload", risk: "Critical", details: "Demand > 40%." });
        } else {
            wasteEvents.push({ issue: "Routine Check", risk: "Low", details: "Standard ops." });
        }


        // Usage Breakdown (Dynamic with Randomness)
        let baseBreakdown = [65, 20, 15]; // Productive, Idle, Wastage
        if (scenario.type === 'HIGH_LOAD') baseBreakdown = [50, 15, 35];
        else if (scenario.type === 'WEEKEND') baseBreakdown = [30, 60, 10];
        else if (scenario.type === 'LEAKAGE') baseBreakdown = [60, 10, 30];

        // Add variance
        const variance1 = Math.floor(Math.random() * 6) - 3;
        const variance2 = Math.floor(Math.random() * 6) - 3;
        const finalBreakdown = [
            baseBreakdown[0] + variance1,
            baseBreakdown[1] + variance2,
            100 - (baseBreakdown[0] + variance1) - (baseBreakdown[1] + variance2)
        ];

        const usageBreakdown = [
            { name: 'Productive Usage', value: finalBreakdown[0], color: '#10b981' }, 
            { name: 'Idle Usage', value: finalBreakdown[1], color: '#f59e0b' },
            { name: 'Wastage', value: finalBreakdown[2], color: '#ef4444' },
        ];

        // Heatmap (Dynamic)
        // Simulate 5 rooms with 12 hour slots (8am - 8pm)
        const heatmap = [
            { room: '101', hours: Array.from({length: 12}, () => Math.floor(Math.random() * (scenario.type === 'WEEKEND' ? 30 : 100))) },
            { room: '102', hours: Array.from({length: 12}, () => Math.floor(Math.random() * (scenario.type === 'HIGH_LOAD' ? 100 : 80))) },
            { room: 'Lab', hours: Array.from({length: 12}, () => Math.floor(Math.random() * (scenario.type === 'LEAKAGE' ? 90 : 60))) }, 
            { room: '301', hours: Array.from({length: 12}, () => Math.floor(Math.random() * 90)) }, // Hostel
            { room: '401', hours: Array.from({length: 12}, () => Math.floor(Math.random() * 40)) }, // Hostel
        ];

        data[dateKey] = {
            date: dateKey,
            scenario: scenario.type,
            totalConsumption: dailyConsumption,
            trends: trends,
            blocks: [ // Varied block data
                { block: 'Block A', consumption: Math.floor(dailyConsumption * (scenario.type === 'WEEKEND' ? 0.1 : 0.3)) },
                { block: 'Block B', consumption: Math.floor(dailyConsumption * 0.2) },
                { block: 'Block C', consumption: Math.floor(dailyConsumption * 0.15) },
                { block: 'Boys Hostel', consumption: Math.floor(dailyConsumption * (scenario.type === 'WEEKEND' ? 0.4 : 0.2)) },
                { block: 'Girls Hostel', consumption: Math.floor(dailyConsumption * (scenario.type === 'WEEKEND' ? 0.35 : 0.15)) },
            ],
            wasteEvents: wasteEvents,
            rooms: generateRooms(scenario.type),
            usageBreakdown: usageBreakdown,
            heatmap: heatmap
        };
    }
    return data;
};

// Generate and Export
export const historicalData = generateHistoricalData();
const todayKey = new Date().toISOString().split('T')[0];
export const currentDayData = historicalData[todayKey] || Object.values(historicalData)[0];

// Fallback exports for existing components
export const energyTrendData = currentDayData.trends;
export const blockConsumptionData = currentDayData.blocks;

// Static data (can be randomized similarly if needed)
export const roomStatusData = [
  { id: 101, name: 'Lec Hall 101', block: 'Block A', status: 'occupied', lights: true, fans: true, power: 450, energy: 5.2 },
  { id: 102, name: 'Lec Hall 102', block: 'Block A', status: 'vacant', lights: false, fans: false, power: 0, energy: 2.1 },
  { id: 103, name: 'Comp Lab', block: 'Block B', status: 'vacant', lights: true, fans: false, power: 120, energy: 3.5, warning: true }, 
  { id: 201, name: 'Chemistry Lab', block: 'Block C', status: 'occupied', lights: true, fans: true, power: 850, energy: 12.5 },
  { id: 301, name: 'Room 301', block: 'Boys Hostel', status: 'occupied', lights: true, fans: true, power: 320, energy: 8.4 },
  { id: 302, name: 'Room 302', block: 'Boys Hostel', status: 'vacant', lights: false, fans: true, power: 60, energy: 1.2, warning: true },
  { id: 401, name: 'Room 401', block: 'Girls Hostel', status: 'occupied', lights: true, fans: false, power: 150, energy: 3.1 },
  { id: 402, name: 'Common Area', block: 'Girls Hostel', status: 'vacant', lights: true, fans: true, power: 400, energy: 4.5, warning: true },
];

export const wastageData = [
  { name: 'Productive Usage', value: 65, color: '#10b981' }, 
  { name: 'Idle Usage', value: 20, color: '#f59e0b' },
  { name: 'Wastage', value: 15, color: '#ef4444' },
];

export const occupancyVsEnergy = [
  { time: '8 AM', occupancy: 40, energy: 250 },
  { time: '10 AM', occupancy: 65, energy: 480 },
  { time: '12 PM', occupancy: 85, energy: 850 },
  { time: '2 PM', occupancy: 70, energy: 780 },
  { time: '4 PM', occupancy: 50, energy: 600 },
  { time: '6 PM', occupancy: 85, energy: 680 },
  { time: '8 PM', occupancy: 95, energy: 850 },
];

export const heatmapData = [
  { room: '101', hours: [80, 80, 70, 60, 50, 40, 50, 70, 90, 95, 90, 80] },
  { room: '102', hours: [20, 10, 5, 0, 0, 5, 10, 30, 60, 80, 70, 50] },
  { room: 'lab', hours: [10, 10, 20, 30, 40, 50, 80, 90, 80, 60, 40, 20] }, 
  { room: '301', hours: [90, 90, 90, 80, 80, 60, 40, 20, 10, 10, 10, 10] },
  { room: '401', hours: [10, 10, 10, 10, 10, 10, 10, 20, 20, 10, 10, 10] },
];

export const recommendationsData = [
  { id: 1, room: 'Comp Lab', block: 'Block B', issue: 'Lights ON in vacant room', insight: 'Occupancy sensor detects 0 people for > 30 mins', recommendation: 'Turn off lights automatically', savings: '12%', priority: 'High', type: 'critical' },
  { id: 2, room: 'Room 302', block: 'Boys Hostel', issue: 'Fan ON in vacant room', insight: 'Room vacant since 9 AM', recommendation: 'Remote fan cutoff', savings: '5%', priority: 'Medium', type: 'warning' },
  { id: 3, room: 'Chemistry Lab', block: 'Block C', issue: 'High baseload power', insight: 'Equipment left running', recommendation: 'Check equipment status', savings: '15%', priority: 'Medium', type: 'improvement' },
  { id: 4, room: 'Common Area', block: 'Girls Hostel', issue: 'Inefficient Cooling', insight: 'AC set to 18°C', recommendation: 'Set to 24°C', savings: '20%', priority: 'Low', type: 'optimization' },
];
