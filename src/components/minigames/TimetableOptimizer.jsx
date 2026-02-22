import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Check, X, Maximize2, Users, LayoutDashboard, Flag } from 'lucide-react';

const CLASSES = [
    { id: 'c1', name: 'CS101 Intro to Programming', size: 120, assignedRoom: null },
    { id: 'c2', name: 'Advanced AI Seminar', size: 15, assignedRoom: null },
    { id: 'c3', name: 'Physics Mechanics Lab', size: 45, assignedRoom: null },
];

const ROOMS = [
    { id: 'r1', name: 'Main Auditorium', capacity: 200, energyCost: 'High' },
    { id: 'r2', name: 'Standard Classroom', capacity: 50, energyCost: 'Medium' },
    { id: 'r3', name: 'Conference Room', capacity: 20, energyCost: 'Low' },
];

const TimetableOptimizer = ({ onBack }) => {
    const [classes, setClasses] = useState(CLASSES);
    const [gameState, setGameState] = useState('playing'); // playing, gameover
    const [score, setScore] = useState(0);

    const handleAssign = (classId, roomId) => {
        setClasses(prev => prev.map(c => c.id === classId ? { ...c, assignedRoom: roomId } : c));
    };

    const checkSolution = () => {
        let currentScore = 0;
        let allAssigned = true;
        let errors = [];

        classes.forEach(c => {
            if (!c.assignedRoom) {
                allAssigned = false;
                return;
            }
            const room = ROOMS.find(r => r.id === c.assignedRoom);
            if (c.size > room.capacity) {
                errors.push(`Overcrowded: ${c.name} (${c.size}) cannot fit in ${room.name} (${room.capacity}).`);
            } else if (room.capacity - c.size > 100) {
                errors.push(`Wastage: Put ${c.name} (${c.size}) in massive ${room.name} (${room.capacity}), wasting AC/Light power.`);
            } else {
                currentScore += 100; // Perfect fit
            }
        });

        if (!allAssigned) {
            alert("Please assign all classes to a room first!");
            return;
        }

        if (errors.length === 0) currentScore += classes.length * 50; // Bonus
        
        setScore(currentScore);
        setGameState('gameover');
    };

    const reset = () => {
        setClasses(CLASSES);
        setGameState('playing');
        setScore(0);
    };

    return (
        <div className="flex flex-col min-h-[85vh] bg-slate-900 rounded-3xl overflow-hidden relative border border-slate-700 shadow-2xl">
            {/* Header */}
            <div className="bg-slate-950 p-6 flex justify-between items-center z-20 border-b border-slate-800">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Calendar className="text-orange-500" /> Timetable Optimizer
                    </h2>
                    <p className="text-slate-400 text-sm">Match class sizes to room capacities to minimize idle HVAC usage.</p>
                </div>
            </div>

            <div className="flex-1 p-8 bg-slate-900 relative">
                {gameState === 'playing' ? (
                    <div className="max-w-5xl mx-auto flex flex-col h-full">
                        <div className="grid grid-cols-2 gap-12 flex-1">
                            {/* Classes (Draggable concept implemented simply via select) */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Users className="text-orange-400" /> Pending Classes
                                </h3>
                                {classes.map(c => (
                                    <div key={c.id} className={`p-4 rounded-2xl border transition-colors ${c.assignedRoom ? 'bg-slate-800/30 border-slate-700/50 opacity-50' : 'bg-slate-800 border-orange-500/40 shadow-lg'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="font-bold text-white leading-tight pr-4">{c.name}</h4>
                                            <div className="bg-slate-700 px-2 py-1 rounded-md text-orange-300 font-mono text-xs whitespace-nowrap">
                                                {c.size} Students
                                            </div>
                                        </div>
                                        
                                        <div className="mt-2">
                                            <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-bold">Assign to Room</label>
                                            <select 
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-orange-500"
                                                value={c.assignedRoom || ''} 
                                                onChange={(e) => handleAssign(c.id, e.target.value)}
                                            >
                                                <option value="" disabled>Select a room...</option>
                                                {ROOMS.map(r => (
                                                    <option key={r.id} value={r.id}>{r.name} (Cap: {r.capacity})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Rooms reference */}
                            <div className="space-y-4 bg-slate-950/50 p-6 rounded-3xl border border-slate-800 h-fit">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Maximize2 className="text-blue-400" /> Campus Rooms
                                </h3>
                                {ROOMS.map(r => (
                                    <div key={r.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                                        <div>
                                            <h4 className="font-bold text-slate-300">{r.name}</h4>
                                            <p className="text-xs text-slate-500">AC / Light Power: <span className="text-red-400 font-bold">{r.energyCost}</span></p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-mono text-blue-300 block">{r.capacity}</span>
                                            <span className="text-[10px] uppercase tracking-wider text-slate-500">Seats</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-4 border-t border-slate-800 pt-6">
                            <button onClick={onBack} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all">Cancel</button>
                            <button 
                                onClick={checkSolution}
                                className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold flex items-center gap-2"
                            >
                                <Flag size={18} /> Submit Roster
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
                        {score > 200 ? (
                            <Check className="text-emerald-500 mx-auto mb-6" size={80} />
                        ) : (
                            <X className="text-red-500 mx-auto mb-6" size={80} />
                        )}
                        <h3 className="text-4xl font-black text-white mb-2">Algorithm Complete</h3>
                        <p className="text-slate-400 text-lg mb-8">Score: <span className="text-orange-400 font-bold">{score} / 450</span></p>

                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8 min-w-[400px]">
                             {score > 200 ? (
                                 <p className="text-emerald-400">Perfect assignments! No energy was wasted cooling empty seats, and no students were left standing.</p>
                             ) : (
                                 <p className="text-red-400">Inefficient scheduling detected. You placed small classes in massive rooms, causing extreme energy waste from the HVAC/Lighting systems.</p>
                             )}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button onClick={reset} className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold transition-all">Retry Roster</button>
                            <button onClick={onBack} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-2 rounded-xl font-bold transition-all">
                                <LayoutDashboard size={18} /> Exit Game
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimetableOptimizer;
