export const generateHistoricalData = () => {
  const data = {};
  const today = new Date();
  
  const scenarios = [
    { type: 'NORMAL', base: 12000, label: 'Standard Operation' },
    { type: 'HIGH_LOAD', base: 18000, label: 'Heatwave / High Demand' },
    { type: 'WEEKEND', base: 8000, label: 'Weekend / Holiday' },
    { type: 'LEAKAGE', base: 14000, label: 'Equipment Malfunction' },
    { type: 'EVENT', base: 16000, label: 'Campus Festival' }
  ];

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    
    // Pick a random scenario, favoring NORMAL
    let scenario = scenarios[0];
    const rand = Math.random();
    if (rand > 0.8) scenario = scenarios[1]; // High Load
    else if (rand > 0.6) scenario = scenarios[3]; // Leakage
    else if (date.getDay() === 0 || date.getDay() === 6) scenario = scenarios[2]; // Weekend logic
    
    // Base fluctuation
    const dailyConsumption = Math.floor(scenario.base + Math.random() * 2000);
    
    const wasteEvents = [];
    
    // Generate context-specific issues
    if (scenario.type === 'HIGH_LOAD') {
        wasteEvents.push({ issue: "HVAC System Overload in Block A", risk: "Critical", details: "Cooling demand exceeding setpoints by 40%." });
        wasteEvents.push({ issue: "Peak Demand Violation", risk: "High", details: "Crossed grid threshold at 2 PM." });
    } else if (scenario.type === 'WEEKEND') {
        wasteEvents.push({ issue: "Unnecessary Lighting in Academic Block", risk: "Medium", details: "Lights active in empty classrooms." });
        wasteEvents.push({ issue: "Cafeteria Refrigeration Check", risk: "Low", details: "Weekend mode not activated." });
    } else if (scenario.type === 'LEAKAGE') {
        wasteEvents.push({ issue: "Water Pump Continuous Run", risk: "High", details: "Pump active for 24h, possible sensor failure." });
        wasteEvents.push({ issue: "Phantom Load in Labs", risk: "Medium", details: "Standby power 3x higher than norm." });
    } else if (scenario.type === 'EVENT') {
        wasteEvents.push({ issue: "Auditorium HVAC Spike", risk: "Medium", details: "Events usage optimized?" });
        wasteEvents.push({ issue: "Stage Lighting Power Draw", risk: "Low", details: "High consumption detected during rehearsal." });
    } else {
        // NORMAL CASE - Add variation so it's not empty
        const normalIssues = [
            { issue: "Routine Sensor Calibration", risk: "Low", details: "Sensors in Block B showing minor drift (0.5°C)." },
            { issue: "Optimize Corridors Lighting", risk: "Low", details: "Daylight harvesting could save 2% in Block A." },
            { issue: "Check Solar Panel Efficiency", risk: "Medium", details: "Output 5% lower than expected clear sky model." },
            { issue: "Computer Lab Sleep Settings", risk: "Low", details: "Check if auto-shutdown policies are active in Lab 3." },
            { issue: "Library HVAC Setpoint", risk: "Low", details: "Temperature set 2°C lower than recommended ASHRAE standards." },
            { issue: "Cafeteria Exhaust Fan Schedule", risk: "Medium", details: "Fans running 2 hours post-closing time." },
            { issue: "Streetlight Timer Adjustment", risk: "Low", details: "Lights turning on 15 mins before sunset." },
            { issue: "Water Cooler Timer Optimization", risk: "Low", details: "Coolers cooling water during weekends/nights." },
            { issue: "Vending Machine Energy Saver", risk: "Low", details: "Compressors cycling too frequently." },
            { issue: "Projector Standby Power", risk: "Low", details: "Classroom projectors drawing 50W in standby." },
            { issue: "Server Room Cold Aisle Containment", risk: "Medium", details: "Mixing of hot/cold air reducing cooling efficiency." },
            { issue: "Thermal Leak Detection", risk: "Medium", details: "Infrared scan suggests gap in Block C windows." },
            { issue: "Motion Sensor Sensitivity", risk: "Low", details: "False triggers in corridors causing lights to stay on." },
            { issue: "Elevator Idle Mode", risk: "Low", details: "Elevators not entering deep sleep mode off-hours." },
            { issue: "Irrigation Pump Schedule", risk: "Medium", details: "Watering occurring during peak evaporation hours." },
            { issue: "Gym Treadmill Standby", risk: "Low", details: "Equipment left fully on 24/7." },
            { issue: "Printer/Copier Eco Mode", risk: "Low", details: "Admin block printers disabling sleep mode." },
            { issue: "Dormitory Geyser Timer", risk: "High", details: "Hot water circulation pumps running continuously." }
        ];
        
        // Pick 3 random normal issues to ensure variety
        const shuffled = normalIssues.sort(() => 0.5 - Math.random());
        wasteEvents.push(shuffled[0]);
        wasteEvents.push(shuffled[1]);
        wasteEvents.push(shuffled[2]);
    }

    data[dateKey] = {
      date: dateKey,
      scenario: scenario.type, // Helper for debug
      totalConsumption: dailyConsumption,
      trends: [
        { time: '00:00', energy: Math.floor(dailyConsumption * 0.05) },
        { time: '04:00', energy: Math.floor(dailyConsumption * 0.04) },
        { time: '08:00', energy: Math.floor(dailyConsumption * 0.15) },
        { time: '12:00', energy: Math.floor(dailyConsumption * (scenario.type === 'HIGH_LOAD' ? 0.35 : 0.25)) }, // Spike at noon for High Load
        { time: '16:00', energy: Math.floor(dailyConsumption * 0.20) },
        { time: '20:00', energy: Math.floor(dailyConsumption * 0.18) },
        { time: '23:59', energy: Math.floor(dailyConsumption * 0.13) },
      ],
      blocks: [
        { block: 'Block A', consumption: Math.floor(dailyConsumption * 0.25) },
        { block: 'Block B', consumption: Math.floor(dailyConsumption * 0.20) },
        { block: 'Block C', consumption: Math.floor(dailyConsumption * 0.15) },
        { block: 'Boys Hostel', consumption: Math.floor(dailyConsumption * 0.20) },
        { block: 'Girls Hostel', consumption: Math.floor(dailyConsumption * 0.20) },
      ],
      wasteEvents: wasteEvents
    };
  }
  return data;
};

export const historicalData = generateHistoricalData();
