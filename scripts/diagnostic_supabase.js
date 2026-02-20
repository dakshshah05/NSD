
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env
const loadEnv = () => {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envFile.split('\n').forEach(line => {
            const [key, val] = line.split('=');
            if (key && val) env[key.trim()] = val.trim().replace(/"/g, '');
        });
        return env;
    } catch (e) {
        return {};
    }
};

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing credentials");
    process.exit(1);
}

// Clients
const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
const anonClient = createClient(supabaseUrl, supabaseAnonKey);


const logStream = fs.createWriteStream('diagnostic_results.txt');
const log = (msg) => {
    console.log(msg);
    logStream.write(msg + '\n');
};

async function checkTable(table) {
    log(`\n--- Checking table: ${table} ---`);
    
    // Check with Service Role (Bypass RLS)
    const { count: serviceCount, error: serviceError } = await serviceClient
        .from(table)
        .select('*', { count: 'exact', head: true });
        
    if (serviceError) {
        log(`[Service] Error: ` + serviceError.message);
    } else {
        log(`[Service] Total Rows: ${serviceCount}`);
    }

    // Check with Anon Key (Respect RLS)
    const { count: anonCount, error: anonError } = await anonClient
        .from(table)
        .select('*', { count: 'exact', head: true });

    if (anonError) {
        log(`[Anon] Error: ` + anonError.message);
    } else {
        log(`[Anon] Visible Rows: ${anonCount}`);
    }
    
    if (serviceCount > 0 && anonCount === 0) {
        log(`⚠️  WARNING: Data exists but is hidden from public (RLS issue).`);
    }
}

async function run() {
    log("Running Supabase Diagnostic...");
    const tables = [
        'daily_stats', 
        'hourly_trends', 
        'block_consumption', 
        'waste_events', 
        'room_status', 
        'recommendations'
    ];

    for (const t of tables) {
        await checkTable(t);
    }
    
    // Check specific data for today
    const today = new Date().toISOString().split('T')[0];
    log(`\n--- Checking Data for Today (${today}) ---`);
    const { data, error } = await serviceClient.from('daily_stats').select('*').eq('date', today);
    if (data && data.length > 0) {
        log("Today's Data: " + JSON.stringify(data[0]));
    } else {
        log("No data for today.");
    }
    logStream.end();
}

run();
