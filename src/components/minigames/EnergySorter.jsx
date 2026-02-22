import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Recycle, Trash2, CheckCircle2, XCircle, ArrowRight, Home } from 'lucide-react';

const ITEMS = [
    { id: 1, name: 'Leaving AC at 18°C', good: false, explanation: 'ACs consume exponentially more power below 24°C.' },
    { id: 2, name: 'Using LED Bulbs', good: true, explanation: 'LEDs use 75% less energy than incandescent lighting.' },
    { id: 3, name: 'Washing clothes in Cold Water', good: true, explanation: 'Heating water accounts for 90% of a washing machine\'s energy.' },
    { id: 4, name: 'Running empty elevators', good: false, explanation: 'Elevator usage contributes to 5% of a tall building\'s load.' },
    { id: 5, name: 'Sleeping computer monitors', good: true, explanation: 'Monitor sleep modes are essential for reducing phantom load.' },
    { id: 6, name: 'Leaving Phone plugged in at 100%', good: false, explanation: 'Trickle charging wastes energy and damages battery life.' },
];

const EnergySorter = ({ onBack }) => {
    const [gameState, setGameState] = useState('menu'); // menu, playing, gameover
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedbacks, setFeedbacks] = useState([]);

    const startGame = () => {
        setGameState('playing');
        setCurrentIndex(0);
        setScore(0);
        setFeedbacks([]);
    };

    const handleSort = (isEcoFriendly) => {
        const item = ITEMS[currentIndex];
        const correct = isEcoFriendly === item.good;
        
        if (correct) {
            setScore(s => s + 100);
        }

        setFeedbacks(prev => [...prev, { item, correct }]);

        if (currentIndex < ITEMS.length - 1) {
            setCurrentIndex(i => i + 1);
        } else {
            setTimeout(() => setGameState('gameover'), 500);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 rounded-3xl overflow-hidden relative border border-slate-700 shadow-2xl">
            {/* Header */}
            <div className="bg-slate-950 p-6 flex justify-between items-center z-20 border-b border-slate-800">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Recycle className="text-emerald-500" /> Efficiency Sorter
                    </h2>
                </div>
                {gameState === 'playing' && (
                    <div className="text-right">
                         <p className="text-xl font-mono font-black text-amber-400">Score: {score}</p>
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900 relative">
                {gameState === 'menu' && (
                    <div className="text-center max-w-md">
                        <Recycle size={64} className="text-emerald-500 mx-auto mb-6" />
                        <h3 className="text-3xl font-black text-white mb-4">Swipe for Green</h3>
                        <p className="text-slate-300 mb-8">
                            Are these daily habits eco-friendly or energy wasters? Sort them correctly to maximize your score.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button onClick={startGame} className="bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded-xl font-bold text-white transition-all">Play Now</button>
                            <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 px-8 py-3 rounded-xl font-bold text-white">Exit</button>
                        </div>
                    </div>
                )}

                {gameState === 'playing' && currentIndex < ITEMS.length && (
                    <div className="w-full max-w-sm">
                        <div className="flex justify-between w-full px-4 mb-4 text-sm font-bold opacity-50">
                            <span className="text-red-400 text-left w-1/3">Waster</span>
                            <span className="text-center w-1/3">{currentIndex + 1} / {ITEMS.length}</span>
                            <span className="text-emerald-400 text-right w-1/3">Eco-Friendly</span>
                        </div>
                        
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: -50 }}
                                className="bg-slate-800 border-2 border-slate-600 rounded-3xl p-10 text-center shadow-xl mb-8 aspect-square flex flex-col items-center justify-center"
                            >
                                <h3 className="text-2xl font-bold text-white mb-2">{ITEMS[currentIndex].name}</h3>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex gap-4 w-full">
                            <button onClick={() => handleSort(false)} className="flex-1 bg-red-600/20 hover:bg-red-600/40 border-2 border-red-500/50 text-red-400 py-6 rounded-2xl font-bold text-lg flex flex-col items-center gap-2 transition-all">
                                <Trash2 size={28} /> Waste
                            </button>
                            <button onClick={() => handleSort(true)} className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/40 border-2 border-emerald-500/50 text-emerald-400 py-6 rounded-2xl font-bold text-lg flex flex-col items-center gap-2 transition-all">
                                <Recycle size={28} /> Eco
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'gameover' && (
                    <div className="w-full max-w-2xl text-center">
                        <h3 className="text-4xl font-black text-white mb-2">Sorting Complete!</h3>
                        <p className="text-xl text-amber-400 font-mono mb-8">Final Score: {score}</p>
                        
                        <div className="bg-slate-800 rounded-2xl border border-slate-700 text-left overflow-hidden mb-8 h-64 overflow-y-auto">
                            {feedbacks.map((fb, i) => (
                                <div key={i} className={`p-4 border-b border-slate-700/50 flex gap-4 items-start ${fb.correct ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                    <div className="mt-1">
                                        {fb.correct ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-red-500" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{fb.item.name}</p>
                                        <p className="text-sm text-slate-400">{fb.item.explanation}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button onClick={startGame} className="bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded-xl font-bold text-white transition-all">Play Again</button>
                            <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2"><Home size={18}/> Back to Hub</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnergySorter;
