
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to read .env manually
const loadEnv = () => {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envFile.split('\n').forEach(line => {
            const [key, val] = line.split('=');
            if (key && val) env[key.trim()] = val.trim().replace(/"/g, ''); // Simple parsing
        });
        return env;
    } catch (e) {
        console.error("Could not read .env file");
        return {};
    }
};

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --- IMPORT DATA GENERATORS (Copying logic efficiently to avoid module issues with imports) ---
// We'll read the data files by importing them if possible, or just copy-paste the logic if they are distinct ESM modules.
// Since they are ESM, we can import them using dynamic import.

const historicalDataPath = path.resolve(process.cwd(), 'src/data/historicalData.js');
const mockDataPath = path.resolve(process.cwd(), 'src/data/mockData.js');

async function seed() {
    console.log("Starting seed process...");
    
    // 1. Dynamic Import of Local Data
    // 1. Dynamic Import of Local Data
    // We import directly from dataGenerator to avoid loading 'supabaseClient' (which uses import.meta.env)
    const dataGeneratorUrl = new URL('../src/data/dataGenerator.js', import.meta.url).href;
    const mockDataUrl = new URL('../src/data/mockData.js', import.meta.url).href;
    
    const { generateHistoricalData } = await import(dataGeneratorUrl);
    const { roomStatusData, recommendationsData } = await import(mockDataUrl);

    // Generate fresh data
    const historicalData = generateHistoricalData();

    console.log(`Loaded ${Object.keys(historicalData).length} days of history.`);

    // 2. Clear existing data (Optional: good for re-seeding)
    // await supabase.from('daily_stats').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Truncate isn't directly exposed via JS client easily without RLS bypass or iteration
    console.log("Clearing old data...");
    await supabase.from('hourly_trends').delete().neq('time', '25:00:00'); // Hacky delete all
    await supabase.from('block_consumption').delete().neq('block_name', 'ZZZ');
    await supabase.from('waste_events').delete().neq('issue', 'ZZZ');
    await supabase.from('daily_stats').delete().neq('scenario', 'ZZZ');
    await supabase.from('room_status').delete().neq('id', -1);
    await supabase.from('recommendations').delete().neq('id', -1);

    // 3. Insert Historical Data
    for (const [date, dayData] of Object.entries(historicalData)) {
        // A. Insert Daily Stats
        const { data: statsData, error: statsError } = await supabase
            .from('daily_stats')
            .insert({
                date: date,
                scenario: dayData.scenario,
                total_consumption: dayData.totalConsumption // Fix: camelCase from generator
            })
            .select()
            .single();

        if (statsError) {
            console.error(`Error inserting stats for ${date}:`, statsError);
            continue;
        }

        const dateId = statsData.date; 

        // B. Insert Hourly Trends
        const trends = dayData.trends.map(t => ({
            date: date,
            time: t.time,
            energy: t.energy
        }));
        const { error: trendsError } = await supabase.from('hourly_trends').insert(trends);
        if (trendsError) console.error(`Error trends for ${date}:`, trendsError);

        // C. Insert Block Consumption
        const blocks = dayData.blocks.map(b => ({
            date: date,
            block_name: b.block,
            consumption: b.consumption
        }));
        const { error: blocksError } = await supabase.from('block_consumption').insert(blocks);
        if (blocksError) console.error(`Error blocks for ${date}:`, blocksError);

        // D. Insert Waste Events
        if (dayData.wasteEvents && dayData.wasteEvents.length > 0) {
             const waste = dayData.wasteEvents.map(w => ({
                date: date,
                issue: w.issue,
                risk: w.risk,
                details: w.details
            }));
            const { error: wasteError } = await supabase.from('waste_events').insert(waste);
            if (wasteError) console.error(`Error waste for ${date}:`, wasteError);
        }
    }

    // 4. Insert Static Mock Data
    console.log("Inserting static room/recommendation data...");
    
    // 4. Insert Static Mock Data
    console.log("Inserting static room/recommendation data...");
    
    // Room Status Mapping (Strict)
    const roomsMapped = roomStatusData.map(r => ({
        id: r.id,
        name: r.name,
        block_name: r.block, // Mapped
        status: r.status,
        lights: r.lights,
        fans: r.fans,
        power: r.power,
        energy: r.energy,
        warning: r.warning
    }));
    
    const { error: roomError } = await supabase.from('room_status').insert(roomsMapped).select();
    if (roomError) console.error("Error inserting room status:", roomError);

    // Recommendations Mapping (Strict)
    const recsMapped = recommendationsData.map(r => ({
        id: r.id,
        room: r.room,
        block_name: r.block, // Mapped
        issue: r.issue,
        insight: r.insight,
        recommendation: r.recommendation,
        savings: r.savings,
        priority: r.priority,
        type: r.type
    }));

    const { error: recError } = await supabase.from('recommendations').insert(recsMapped).select();
    if (recError) console.error("Error inserting recommendations:", recError);

    console.log("Seeding complete!");
}

seed().catch(e => console.error(e));
