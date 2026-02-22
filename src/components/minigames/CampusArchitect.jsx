import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Sun, Wind, ThermometerSun, Leaf, Settings, Home, ArrowRight } from 'lucide-react';

const UPGRADES_POOL = [
    { id: 'solar', name: 'Rooftop Solar', cost: 50000, savings: 15000, co2: -120, icon: Sun, color: 'text-yellow-400' },
    { id: 'insulation', name: 'Thermal Insulation', cost: 20000, savings: 8000, co2: -40, icon: ThermometerSun, color: 'text-orange-400' },
    { id: 'smart_hvac', name: 'Smart HVAC System', cost: 80000, savings: 30000, co2: -250, icon: Wind, color: 'text-blue-400' },
    { id: 'led_lighting', name: 'LED Auto-Sensors', cost: 15000, savings: 12000, co2: -70, icon: Leaf, color: 'text-emerald-400' },
    { id: 'low_flow', name: 'Low-Flow Fixtures', cost: 8000, savings: 5000, co2: -15, icon: ThermometerSun, color: 'text-cyan-400' },
    { id: 'geothermal', name: 'Geothermal Heat', cost: 120000, savings: 45000, co2: -400, icon: Sun, color: 'text-red-500' },
    { id: 'smart_glass', name: 'Electrochromic Glass', cost: 35000, savings: 10000, co2: -65, icon: Building2, color: 'text-sky-300' },
    { id: 'wind_turbine', name: 'Micro Wind Turbine', cost: 40000, savings: 11000, co2: -90, icon: Wind, color: 'text-slate-300' },
];

const getRandomUpgrades = () => {
    let result = [...UPGRADES_POOL];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result.slice(0, 4);
};

const CampusArchitect = ({ onBack }) => {
    const [gameState, setGameState] = useState('planning'); // planning, simulation, results
    const [budget, setBudget] = useState(100000);
    const [availableUpgrades, setAvailableUpgrades] = useState(getRandomUpgrades());
    const [selectedUpgrades, setSelectedUpgrades] = useState([]);
    const [results, setResults] = useState(null);

    const toggleUpgrade = (upgrade) => {
        const isSelected = selectedUpgrades.find(u => u.id === upgrade.id);
        if (isSelected) {
            setSelectedUpgrades(prev => prev.filter(u => u.id !== upgrade.id));
            setBudget(b => b + upgrade.cost);
        } else {
            if (budget >= upgrade.cost) {
                setSelectedUpgrades(prev => [...prev, upgrade]);
                setBudget(b => b - upgrade.cost);
            }
        }
    };

    const runSimulation = () => {
        setGameState('simulation');
        setTimeout(() => {
            const totalSavings = selectedUpgrades.reduce((sum, u) => sum + u.savings, 0);
            const totalCo2 = selectedUpgrades.reduce((sum, u) => sum + u.co2, 0);
            // 5 year projection
            setResults({
                roi: ((totalSavings * 5) - (100000 - budget)) / (100000 - budget || 1) * 100,
                fiveYearSavings: totalSavings * 5,
                co2Reduction: Math.abs(totalCo2 * 5),
            });
            setGameState('results');
        }, 2000);
    };

    const resetGame = () => {
        setGameState('planning');
        setBudget(100000);
        setSelectedUpgrades([]);
        setAvailableUpgrades(getRandomUpgrades());
        setResults(null);
    };

    return (
        <div className="flex flex-col min-h-[85vh] bg-slate-900 rounded-3xl overflow-hidden relative border border-slate-700 shadow-2xl">
            {/* Header */}
            <div className="bg-slate-950 p-6 flex justify-between items-center z-20 border-b border-slate-800">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Building2 className="text-sky-400" /> Campus Architect
                    </h2>
                    <p className="text-slate-400 text-sm">Strategic simulation for green building upgrades.</p>
                </div>
                {gameState === 'planning' && (
                    <div className="text-right bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
                         <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Remaining Budget</p>
                         <p className={`text-xl font-mono font-black ${budget < 10000 ? 'text-red-400' : 'text-emerald-400'}`}>${budget.toLocaleString()}</p>
                    </div>
                )}
            </div>

            <div className="flex-1 p-8 bg-slate-900 overflow-y-auto">
                {gameState === 'planning' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8 p-6 bg-sky-900/20 border border-sky-500/20 rounded-2xl flex items-start gap-4">
                            <Settings className="text-sky-400 mt-1 shrink-0" size={24} />
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Director's Memo: Block B Renovation</h3>
                                <p className="text-slate-300">
                                    You have been allocated a strictly bounded budget of $100,000 for sustainability upgrades in Block B. 
                                    Select the upgrades that will maximize the 5-Year Return on Investment (ROI) and minimize carbon footprint.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableUpgrades.map(upgrade => {
                                const isSelected = selectedUpgrades.find(u => u.id === upgrade.id);
                                const canAfford = budget >= upgrade.cost;
                                return (
                                    <button
                                        key={upgrade.id}
                                        onClick={() => toggleUpgrade(upgrade)}
                                        disabled={!isSelected && !canAfford}
                                        className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
                                            isSelected ? 'bg-sky-900/40 border-sky-500' : 
                                            !canAfford ? 'bg-slate-800/50 border-slate-700 opacity-50 cursor-not-allowed' :
                                            'bg-slate-800 border-slate-700 hover:border-slate-500'
                                        }`}
                                    >
                                        <div className="relative z-10 flex gap-4">
                                            <div className={`p-4 rounded-xl shrink-0 ${isSelected ? 'bg-sky-500/20' : 'bg-slate-700'}`}>
                                                <upgrade.icon size={24} className={isSelected ? 'text-sky-400' : 'text-slate-400'} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-white text-lg">{upgrade.name}</h4>
                                                <div className="mt-2 space-y-1 font-mono text-sm">
                                                    <p className="text-red-400">Cost: -${upgrade.cost.toLocaleString()}</p>
                                                    <p className="text-emerald-400">Savings/yr: +${upgrade.savings.toLocaleString()}</p>
                                                    <p className="text-sky-400">CO₂: {upgrade.co2}kg / yr</p>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        
                        <div className="mt-8 flex justify-end gap-4">
                            <button onClick={onBack} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-2">
                                <Home size={18}/> Hub
                            </button>
                            <button 
                                onClick={runSimulation}
                                disabled={selectedUpgrades.length === 0}
                                className="px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
                            >
                                Run 5-Year Simulation <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'simulation' && (
                    <div className="h-full flex flex-col items-center justify-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        >
                            <Settings size={64} className="text-sky-500 opacity-50" />
                        </motion.div>
                        <h3 className="mt-6 text-2xl font-bold text-white">Running 5-Year Financial & Climate Models...</h3>
                        <p className="text-slate-400 mt-2 font-mono">Compiling {selectedUpgrades.length} upgrades.</p>
                    </div>
                )}

                {gameState === 'results' && results && (
                    <div className="max-w-2xl mx-auto text-center mt-10">
                        <h3 className="text-4xl font-black text-white mb-2">Simulation Complete</h3>
                        <p className="text-slate-400 mb-8">Here are the long-term results of your architectural decisions.</p>
                        
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                                <p className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-bold">Total Spent</p>
                                <p className="text-2xl font-mono font-bold text-red-400">${(100000 - budget).toLocaleString()}</p>
                            </div>
                            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                                <p className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-bold">5-Yr Savings</p>
                                <p className="text-2xl font-mono font-bold text-emerald-400">+${results.fiveYearSavings.toLocaleString()}</p>
                            </div>
                            <div className="bg-slate-800 rounded-2xl p-6 border border-sky-500/30">
                                <p className="text-xs uppercase tracking-wider text-sky-400 mb-2 font-bold">Total ROI</p>
                                <p className="text-3xl font-mono font-black text-sky-400">{results.roi.toFixed(1)}%</p>
                            </div>
                        </div>

                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-8 text-left flex items-start gap-4">
                            <Leaf className="text-emerald-500 mt-1" size={24} />
                            <div>
                                <h4 className="font-bold text-emerald-400 text-lg mb-1">Environmental Impact</h4>
                                <p className="text-emerald-100">Your configuration will prevent <strong className="font-mono text-xl">{results.co2Reduction.toLocaleString()}kg</strong> of CO₂ from entering the atmosphere over the specific timeframe!</p>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button onClick={resetGame} className="px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition-all">Redesign Block B</button>
                            <button onClick={onBack} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-2 rounded-xl font-bold transition-all">
                                <Home size={18} /> Back Hub
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampusArchitect;
