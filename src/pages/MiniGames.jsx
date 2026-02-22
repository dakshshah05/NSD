import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertTriangle, PowerOff, Award, RotateCcw, Home, Monitor, Server, Lightbulb, Coffee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const MAX_GRID_CAPACITY = 1000; // in kW

const APPLIANCE_TYPES = [
    { name: 'Server Rack', power: 250, icon: Server, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { name: 'Old HVAC', power: 300, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/20' },
    { name: 'Lab Computers', power: 150, icon: Monitor, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { name: 'Florescent Lights', power: 80, icon: Lightbulb, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { name: 'Cafeteria Oven', power: 200, icon: Coffee, color: 'text-amber-500', bg: 'bg-amber-500/20' },
];

const MiniGames = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    
    const [gameState, setGameState] = useState('menu'); // menu, playing, gameover
    const [score, setScore] = useState(0);
    const [currentLoad, setCurrentLoad] = useState(0);
    const [activeAppliances, setActiveAppliances] = useState([]);
    const [gameSpeed, setGameSpeed] = useState(2000);
    
    // Refs for intervals to prevent stale closures
    const activeRef = useRef(activeAppliances);
    const loadRef = useRef(currentLoad);
    const stateRef = useRef(gameState);
    
    useEffect(() => { activeRef.current = activeAppliances; }, [activeAppliances]);
    useEffect(() => { loadRef.current = currentLoad; }, [currentLoad]);
    useEffect(() => { stateRef.current = gameState; }, [gameState]);

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setCurrentLoad(0);
        setActiveAppliances([]);
        setGameSpeed(2000);
    };

    // Game Loop - Spawning
    useEffect(() => {
        if (gameState !== 'playing') return;

        const spawnInterval = setInterval(() => {
            if (activeRef.current.length > 8) return; // Max on screen
            
            const randomType = APPLIANCE_TYPES[Math.floor(Math.random() * APPLIANCE_TYPES.length)];
            const newAppliance = {
                id: Date.now() + Math.random(),
                ...randomType,
                x: Math.random() * 80 + 10, // 10% to 90%
                y: Math.random() * 60 + 20, // 20% to 80%
            };
            
            setActiveAppliances(prev => [...prev, newAppliance]);
        }, gameSpeed);

        return () => clearInterval(spawnInterval);
    }, [gameState, gameSpeed]);

    // Game Loop - Grid Load Evaluation
    useEffect(() => {
        if (gameState !== 'playing') return;

        const loadInterval = setInterval(() => {
            const totalLoad = activeRef.current.reduce((sum, app) => sum + app.power, 0);
            setCurrentLoad(totalLoad);
            
            if (totalLoad >= MAX_GRID_CAPACITY) {
                setGameState('gameover');
                awardSupabasePoints(Math.floor(score / 10)); // Convert score to green points securely!
            }
        }, 500);

        return () => clearInterval(loadInterval);
    }, [gameState, score]);
    
    // Difficulty curve
    useEffect(() => {
        if (gameState === 'playing' && score > 0 && score % 500 === 0) {
             setGameSpeed(prev => Math.max(600, prev - 200)); // Gets faster
        }
    }, [score, gameState]);

    const handleTurnOff = (id) => {
        if (gameState !== 'playing') return;
        const app = activeAppliances.find(a => a.id === id);
        if (app) {
             setScore(s => s + app.power);
             setActiveAppliances(prev => prev.filter(a => a.id !== id));
        }
    };

    const awardSupabasePoints = async (earnedPoints) => {
        if (earnedPoints <= 0) return;
        if (user?.id) {
            await supabase.rpc('add_green_points', { user_id: user.id, points_to_add: earnedPoints });
            addNotification('Game Over!', `You kept the grid stable and earned +${earnedPoints} Green Points!`, 'success');
        }
    };

    const loadPercentage = Math.min(100, (currentLoad / MAX_GRID_CAPACITY) * 100);
    let loadColor = 'bg-emerald-500';
    if (loadPercentage > 60) loadColor = 'bg-yellow-500';
    if (loadPercentage > 85) loadColor = 'bg-red-500';

    return (
        <div className="min-h-[85vh] bg-[rgb(var(--bg-main))] text-white rounded-3xl border border-[rgb(var(--border))] overflow-hidden flex flex-col relative animate-fade-in shadow-2xl">
            
            {/* Header */}
            <div className="p-6 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] flex justify-between items-center z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/impact')} className="p-2 bg-[rgb(var(--bg-input))] hover:bg-slate-700 rounded-xl transition-colors">
                        <Home size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Zap className="text-amber-400" /> Campus Grid Balancer
                        </h1>
                        <p className="text-slate-400 text-sm">Prevent blackouts by switching off idle loads!</p>
                    </div>
                </div>
                
                {gameState === 'playing' && (
                    <div className="text-right">
                        <p className="text-sm text-slate-400 uppercase tracking-wider font-bold mb-1">Score</p>
                        <p className="text-3xl font-black text-emerald-400 font-mono">{score}</p>
                    </div>
                )}
            </div>

            {/* Game Area */}
            <div className="flex-1 relative overflow-hidden bg-slate-900 grid-pattern">
               {/* Background grid styling */}
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />

               {gameState === 'menu' && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-slate-900/80 backdrop-blur-sm">
                       <Zap size={64} className="text-amber-400 mb-6 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-pulse" />
                       <h2 className="text-4xl font-black mb-4">Grid Stability Protocol</h2>
                       <p className="text-slate-300 max-w-md text-center mb-8">
                           Classes are over, but appliances are randomly turning on! Click them to cut the power before the campus grid exceeds {MAX_GRID_CAPACITY}kW and causes a blackout.
                       </p>
                       <button onClick={startGame} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-105">
                           Start Shift
                       </button>
                   </div>
               )}

               {gameState === 'gameover' && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-red-950/90 backdrop-blur-md">
                       <AlertTriangle size={80} className="text-red-500 mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
                       <h2 className="text-5xl font-black text-red-100 mb-2 tracking-wider">BLACKOUT!</h2>
                       <p className="text-red-400 text-lg mb-8">Campus grid capacity exceeded.</p>
                       
                       <div className="bg-slate-900/50 p-6 rounded-2xl border border-red-500/30 text-center mb-8 min-w-[300px]">
                           <p className="text-slate-400 uppercase tracking-widest text-xs mb-1">Final Score</p>
                           <p className="text-4xl font-mono font-bold text-white mb-4">{score}</p>
                           <div className="bg-emerald-500/20 text-emerald-300 py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                               <Award size={18} />
                               Earned +{Math.floor(score / 10)} Green Points
                           </div>
                       </div>

                       <div className="flex gap-4">
                           <button onClick={startGame} className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105">
                               <RotateCcw size={18} /> Try Again
                           </button>
                           <button onClick={() => navigate('/impact')} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all">
                               Exit
                           </button>
                       </div>
                   </div>
               )}

               {/* Active Appliances */}
               {gameState === 'playing' && (
                   <AnimatePresence>
                       {activeAppliances.map(app => (
                           <motion.button
                               key={app.id}
                               initial={{ opacity: 0, scale: 0, rotate: -20 }}
                               animate={{ opacity: 1, scale: 1, rotate: 0 }}
                               exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                               whileHover={{ scale: 1.1 }}
                               whileTap={{ scale: 0.9 }}
                               onClick={() => handleTurnOff(app.id)}
                               className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-2xl flex flex-col items-center justify-center border shadow-xl cursor-crosshair group backdrop-blur-md ${app.bg} border-slate-700 hover:border-emerald-500 z-10`}
                               style={{ left: `${app.x}%`, top: `${app.y}%` }}
                           >
                               <app.icon size={32} className={`${app.color} mb-2 group-hover:text-emerald-400 transition-colors drop-shadow-[0_0_8px_currentColor]`} />
                               <span className="font-bold text-xs whitespace-nowrap text-slate-200">{app.name}</span>
                               <span className="font-mono text-xs text-red-300 mt-1 font-bold">{app.power} kW</span>
                               
                               {/* Target reticle hover effect */}
                               <div className="absolute inset-0 border-2 border-emerald-400 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity animate-pulse pointer-events-none" />
                           </motion.button>
                       ))}
                   </AnimatePresence>
               )}
            </div>

            {/* Bottom Grid Status Bar */}
            <div className="bg-slate-950 p-6 border-t border-slate-800 z-20">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-1 flex items-center gap-2">
                            <Activity size={14} className={loadPercentage > 85 ? 'text-red-500 animate-pulse' : 'text-emerald-500'} />
                            Live Campus Load
                        </p>
                        <p className="text-2xl font-mono font-bold">
                            <span className={loadPercentage > 85 ? 'text-red-500' : 'text-white'}>{currentLoad}</span> 
                            <span className="text-slate-500 text-lg"> / {MAX_GRID_CAPACITY} kW</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <span className={`text-lg font-bold ${loadPercentage > 85 ? 'text-red-500 animate-pulse' : 'text-slate-300'}`}>
                            {Math.round(loadPercentage)}%
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                    <motion.div 
                        className={`h-full ${loadColor}`}
                        animate={{ width: `${loadPercentage}%` }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                    />
                </div>
            </div>
            
        </div>
    );
};

// Activity icon substitution
function Activity(props) {
    return <Zap {...props} />;
}

export default MiniGames;
