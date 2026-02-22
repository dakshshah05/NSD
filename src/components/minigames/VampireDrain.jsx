import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Power, Timer, AlertTriangle, Monitor, Tv, Smartphone, Battery, Coffee, Play, Award, RotateCcw } from 'lucide-react';

const PHANTOM_LOADS_POOL = [
    { id: 1, name: 'Phone Charger', power: 5, icon: Smartphone },
    { id: 2, name: 'TV on Standby', power: 15, icon: Tv },
    { id: 3, name: 'Idle PC Monitor', power: 25, icon: Monitor },
    { id: 4, name: 'Coffee Machine', power: 10, icon: Coffee },
    { id: 5, name: 'Laptop Brick', power: 8, icon: Battery },
    { id: 6, name: 'Microwave Clock', power: 3, icon: AlertTriangle },
    { id: 7, name: 'Space Heater', power: 45, icon: Power },
    { id: 8, name: 'Router', power: 12, icon: Power },
];

const getRandomLoads = () => {
    let result = [...PHANTOM_LOADS_POOL];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    // Pick 6 random loads and assign random coordinates
    return result.slice(0, 6).map(load => ({
        ...load,
        id: Math.random(), // Ensure unique ID for this round
        found: false,
        x: Math.random() * 70 + 10,
        y: Math.random() * 70 + 10
    }));
};

const GAME_TIME = 15; // seconds

const VampireDrain = ({ onBack }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, gameover
    const [loads, setLoads] = useState([]);
    const [timeLeft, setTimeLeft] = useState(GAME_TIME);
    const [score, setScore] = useState(0);

    const startGame = () => {
        setLoads(getRandomLoads());
        setTimeLeft(GAME_TIME);
        setScore(0);
        setGameState('playing');
    };

    useEffect(() => {
        if (gameState !== 'playing') return;

        if (timeLeft <= 0) {
            setGameState('gameover');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(t => t - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, gameState]);

    const handleFound = (id, power) => {
        if (gameState !== 'playing') return;
        
        setLoads(prev => prev.map(l => l.id === id ? { ...l, found: true } : l));
        setScore(s => s + power);

        // Check win
        if (loads.filter(l => !l.found && l.id !== id).length === 0) {
            setGameState('gameover');
        }
    };

    const allFound = loads.every(l => l.found);

    return (
        <div className="flex flex-col min-h-[85vh] bg-slate-900 rounded-3xl overflow-hidden relative border border-slate-700 shadow-2xl">
            {/* Header */}
            <div className="bg-slate-950 p-6 flex justify-between items-center z-20 border-b border-slate-800">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Power className="text-purple-500" /> Vampire Drain Detective
                    </h2>
                    <p className="text-slate-400 text-sm">Find and unplug idle electronics before dawn!</p>
                </div>
                <div className="flex gap-6 text-right">
                    <div className="text-right">
                         <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Time</p>
                         <p className={`text-2xl font-mono font-black ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>00:{timeLeft.toString().padStart(2, '0')}</p>
                    </div>
                    <div className="text-right">
                         <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Watts Saved</p>
                         <p className="text-2xl font-mono font-black text-amber-400">{score}W</p>
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <div className="flex-1 relative overflow-hidden bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

                {gameState === 'start' && (
                    <div className="absolute inset-0 flex items-center justify-center z-30">
                        <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-lg text-center shadow-2xl backdrop-blur-md">
                            <Power size={64} className="text-purple-500 mx-auto mb-6" />
                            <h3 className="text-3xl font-black text-white mb-4">Vampire Loads</h3>
                            <p className="text-slate-300 mb-8 leading-relaxed">
                                Electronics consume energy even when turned off if they remain plugged in. This is called a "Phantom" or "Vampire" load. 
                                <br/><br/>
                                You have {GAME_TIME} seconds to find and unplug all idle devices in the dark!
                            </p>
                            <div className="flex justify-center gap-4">
                                <button onClick={startGame} className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
                                    <Play size={20} /> Hunt Vampires
                                </button>
                                <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all">
                                    Exit
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {gameState === 'gameover' && (
                    <div className="absolute inset-0 flex items-center justify-center z-30 bg-slate-950/90 backdrop-blur-md">
                        <div className="text-center animate-fade-in">
                            {allFound ? (
                                <Award size={80} className="text-emerald-500 mx-auto mb-6" />
                            ) : (
                                <Timer size={80} className="text-red-500 mx-auto mb-6" />
                            )}
                            <h3 className="text-4xl font-black text-white mb-2">
                                {allFound ? 'Campus Saved!' : 'Sun is Up!'}
                            </h3>
                            <p className="text-slate-400 text-lg mb-8">
                                You unplugged <span className="text-amber-400 font-bold">{score}W</span> of phantom loads.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button onClick={startGame} className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
                                    <RotateCcw size={20} /> Play Again
                                </button>
                                <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all">
                                    Back to Hub
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {gameState === 'playing' && (
                    <>
                        {/* Flashlight Mask Effect around cursor (simplified via CSS radial gradient) */}
                        <div className="absolute inset-0 pointer-events-none z-0 mix-blend-multiply opacity-50 bg-black" />
                        
                        <AnimatePresence>
                            {loads.map(load => !load.found && (
                                <motion.button
                                    key={load.id}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    whileHover={{ scale: 1.2 }}
                                    onClick={() => handleFound(load.id, load.power)}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 p-3 text-purple-400 hover:text-white bg-slate-900/40 hover:bg-purple-600 border border-purple-500/30 hover:border-purple-400 rounded-full transition-all group shadow-[0_0_15px_rgba(168,85,247,0.2)] z-10"
                                    style={{ left: `${load.x}%`, top: `${load.y}%` }}
                                >
                                    <load.icon size={24} className="opacity-70 group-hover:opacity-100 animate-pulse" />
                                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-xs px-2 py-1 rounded border border-slate-700 opacity-0 group-hover:opacity-100 whitespace-nowrap text-white transition-opacity font-bold">
                                        Unplug {load.name}
                                    </span>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div>
    );
};

export default VampireDrain;
