import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Zap, PowerOff, Recycle, Building2, Calendar, Home, Play, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import GridBalancer from '../components/minigames/GridBalancer';
import VampireDrain from '../components/minigames/VampireDrain';
import EnergySorter from '../components/minigames/EnergySorter';
import CampusArchitect from '../components/minigames/CampusArchitect';
import TimetableOptimizer from '../components/minigames/TimetableOptimizer';

const GAMES = [
    {
        id: 'grid_balancer',
        title: 'Grid Balancer',
        description: 'Stop a campus blackout by quickly shutting off phantom loads.',
        icon: Zap,
        color: 'from-amber-400 to-orange-600',
        textColor: 'text-amber-400',
        bgGlow: 'bg-amber-500/20',
        tags: ['Reflexes', 'Grid Load']
    },
    {
        id: 'vampire_drain',
        title: 'Vampire Detective',
        description: 'Find and unplug idle electronics in the dark before time runs out.',
        icon: PowerOff,
        color: 'from-purple-400 to-fuchsia-600',
        textColor: 'text-purple-400',
        bgGlow: 'bg-purple-500/20',
        tags: ['Hidden Object', 'Phantom Power']
    },
    {
        id: 'energy_sorter',
        title: 'Efficiency Sorter',
        description: 'Swipe left on energy-wasting habits and right on eco-friendly ones.',
        icon: Recycle,
        color: 'from-emerald-400 to-teal-600',
        textColor: 'text-emerald-400',
        bgGlow: 'bg-emerald-500/20',
        tags: ['Knowledge', 'Daily Habits']
    },
    {
        id: 'campus_architect',
        title: 'Campus Architect',
        description: 'Manage a $100k budget to buy green upgrades for Block B and maximize ROI.',
        icon: Building2,
        color: 'from-sky-400 to-blue-600',
        textColor: 'text-sky-400',
        bgGlow: 'bg-sky-500/20',
        tags: ['Strategy', 'ROI']
    },
    {
        id: 'timetable_optimizer',
        title: 'Timetable Optimizer',
        description: 'Match class sizes to rooms to minimize wasted HVAC & lighting energy.',
        icon: Calendar,
        color: 'from-orange-400 to-red-600',
        textColor: 'text-orange-400',
        bgGlow: 'bg-orange-500/20',
        tags: ['Puzzle', 'Logistics']
    }
];

const MiniGames = () => {
    const navigate = useNavigate();
    const [selectedGame, setSelectedGame] = useState(null);

    const handleBack = () => {
        setSelectedGame(null);
    };

    if (selectedGame === 'grid_balancer') return <GridBalancer onBack={handleBack} />;
    if (selectedGame === 'vampire_drain') return <VampireDrain onBack={handleBack} />;
    if (selectedGame === 'energy_sorter') return <EnergySorter onBack={handleBack} />;
    if (selectedGame === 'campus_architect') return <CampusArchitect onBack={handleBack} />;
    if (selectedGame === 'timetable_optimizer') return <TimetableOptimizer onBack={handleBack} />;

    return (
        <div className="flex flex-col h-full bg-[rgb(var(--bg-main))] text-white animate-fade-in relative">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sky-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                        <div className="p-3 bg-indigo-500/20 rounded-2xl">
                            <Gamepad2 className="text-indigo-400" size={32} />
                        </div>
                        Campus Arcade
                    </h1>
                    <p className="text-slate-400 text-lg">Play educational mini-games to master energy efficiency.</p>
                </div>
                <button 
                    onClick={() => navigate('/impact')} 
                    className="p-3 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] hover:bg-slate-800 rounded-2xl transition-all shadow-lg flex items-center gap-2 font-bold"
                >
                    <Home size={20} className="text-slate-300" /> Return to Earth
                </button>
            </div>

            {/* Game Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {GAMES.map((game, index) => (
                        <motion.button
                            key={game.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedGame(game.id)}
                            className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] hover:border-slate-500 rounded-3xl p-6 text-left relative overflow-hidden group shadow-xl transition-all h-full flex flex-col"
                        >
                            {/* Hover Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                            
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-4 rounded-2xl ${game.bgGlow} shadow-inner`}>
                                        <game.icon size={32} className={game.textColor} />
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0 duration-300">
                                        <div className="p-2 bg-[rgb(var(--bg-input))] rounded-full">
                                            <Play size={16} className={game.textColor} />
                                        </div>
                                    </div>
                                </div>
                                
                                <h3 className="text-2xl font-bold mb-2 group-hover:text-white transition-colors">{game.title}</h3>
                                <p className="text-slate-400 mb-6 flex-1 line-clamp-3 leading-relaxed">
                                    {game.description}
                                </p>
                                
                                <div className="flex gap-2 flex-wrap mt-auto">
                                    {game.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-[rgb(var(--bg-input))] border border-[rgb(var(--border))] rounded-lg text-xs font-bold text-slate-300">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.button>
                    ))}
                    
                    {/* Placeholder for future games */}
                    <motion.div
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: GAMES.length * 0.1 }}
                         className="bg-[rgb(var(--bg-card))] border border-dashed border-slate-700/50 rounded-3xl p-6 flex flex-col items-center justify-center text-center opacity-50"
                    >
                        <Gamepad2 size={48} className="text-slate-600 mb-4" />
                        <h3 className="text-xl font-bold text-slate-400 mb-2">More Games Coming Soon</h3>
                        <p className="text-slate-500 text-sm">Stay tuned for future updates.</p>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MiniGames;
