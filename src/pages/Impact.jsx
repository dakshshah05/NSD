import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars, Text } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Leaf, Zap, AlertTriangle, Send, ChevronRight, Droplets, Wind, UserCheck, Search, Users } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

// --- 3D Components ---

const FuturisticGlobe = () => {
  const sphereRef = useRef();
  
  useFrame((state) => {
    if (sphereRef.current) {
        sphereRef.current.rotation.y += 0.005;
        sphereRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={sphereRef} args={[1, 64, 64]} scale={1.8}>
        <MeshDistortMaterial 
          color="#10b981" 
          emissive="#059669"
          emissiveIntensity={0.5}
          wireframe={true}
          distort={0.3} 
          speed={2} 
          roughness={0.2}
        />
      </Sphere>
      {/* Glow effect behind the globe */}
      <Sphere args={[1.2, 32, 32]} scale={1.9} position={[0, 0, -0.5]}>
          <meshBasicMaterial color="#10b981" transparent opacity={0.1} />
      </Sphere>
    </Float>
  );
};

const Trophy3D = () => {
    const trophyRef = useRef();
    useFrame(() => {
        if(trophyRef.current) {
            trophyRef.current.rotation.y += 0.02;
        }
    });

    return (
        <Float speed={3} rotationIntensity={1} floatIntensity={2}>
            <group ref={trophyRef} scale={0.8}>
                {/* Base */}
                <mesh position={[0, -1, 0]}>
                    <cylinderGeometry args={[0.5, 0.7, 0.4, 32]} />
                    <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
                </mesh>
                {/* Stem */}
                <mesh position={[0, -0.3, 0]}>
                    <cylinderGeometry args={[0.1, 0.2, 1, 32]} />
                    <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
                </mesh>
                {/* Cup */}
                <mesh position={[0, 0.8, 0]}>
                    <sphereGeometry args={[0.6, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.1} />
                </mesh>
                {/* Inner Glow */}
                <pointLight position={[0, 1, 0]} color="#fcd34d" intensity={2} distance={2} />
            </group>
        </Float>
    );
};

// --- Gamification Data ---
const HOSTEL_RANKINGS = [
    { id: 1, name: "Block A (Senior Hostel)", score: 98, saved: "450 kWh", trend: "up", icon: Trophy, color: "text-amber-400" },
    { id: 2, name: "Block C (Freshers)", score: 85, saved: "320 kWh", trend: "up", icon: Shield, color: "text-slate-300" }, // Replaced Shield with Users below inline
    { id: 3, name: "Main Academic Block", score: 72, saved: "210 kWh", trend: "down", icon: null, color: "text-amber-700" },
    { id: 4, name: "Block B (Girls Hostel)", score: 65, saved: "180 kWh", trend: "down", icon: null, color: "text-slate-500" },
];

const Impact = () => {
  const { addNotification } = useNotifications();
  const [reportType, setReportType] = useState('electricity');
  const [reportLocation, setReportLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gamification & Real world metrics
  const treesPlanted = 124;
  const co2Avoided = 850; // kg
  const mealsFunded = 32;

  const handleReportSubmit = (e) => {
      e.preventDefault();
      if(!reportLocation) return;
      
      setIsSubmitting(true);
      setTimeout(() => {
          setIsSubmitting(false);
          setReportLocation('');
          addNotification('Report Submitted', `Thank you for reporting wastage at ${reportLocation}! +50 Green Points awarded.`, 'success');
      }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in relative z-10 pb-12 overflow-x-hidden">
      
      {/* --- HERO SECTION WITH 3D --- */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 h-[400px]">
         {/* 3D Canvas Background */}
         <div className="absolute inset-0 z-0">
             <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                 <ambientLight intensity={0.5} />
                 <directionalLight position={[10, 10, 5]} intensity={1} color="#10b981" />
                 <pointLight position={[-10, -10, -5]} intensity={0.5} color="#0284c7" />
                 <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                 <FuturisticGlobe />
             </Canvas>
         </div>

         {/* Hero Overlay Content */}
         <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent pointer-events-none" />
         
         <div className="relative z-20 h-full flex flex-col justify-center p-8 md:p-12 w-full md:w-2/3 lg:w-1/2">
             <motion.div
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8, ease: "easeOut" }}
             >
                 <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full backdrop-blur-md mb-6">
                     <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                     </span>
                     <span className="text-emerald-300 text-sm font-semibold tracking-wider uppercase">Live Impact</span>
                 </div>
                 
                 <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
                     Our Campus.<br />
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Our Future.</span>
                 </h1>
                 <p className="text-slate-300 text-lg md:text-xl max-w-xl font-light leading-relaxed">
                     Join the college-wide initiative to reduce carbon emissions. Every watt saved contributes to a greener, smarter institution.
                 </p>
             </motion.div>
         </div>
      </div>

      {/* --- REAL WORLD METRICS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
              { title: "Trees Equivalent", value: treesPlanted, unit: "Planted", icon: Leaf, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-500/20" },
              { title: "CO₂ Emissions Saved", value: co2Avoided, unit: "kg", icon: Wind, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-500/20" },
              { title: "Cafeteria Meals", value: mealsFunded, unit: "Funded", icon: Droplets, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-500/20" }
          ].map((stat, i) => (
              <motion.div 
                 key={i}
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.5, delay: i * 0.15 }}
                 className={`relative overflow-hidden group bg-[rgb(var(--bg-card))] border ${stat.border} rounded-3xl p-6 hover:shadow-2xl transition-all duration-500`}
              >
                  <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${stat.bg} blur-3xl group-hover:blur-2xl transition-all duration-500 opacity-50`} />
                  
                  <div className="relative z-10 flex items-start justify-between">
                      <div>
                          <p className="text-sm font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-2">{stat.title}</p>
                          <div className="flex items-baseline space-x-2">
                             <span className={`text-4xl font-black ${stat.color}`}>{stat.value}</span>
                             <span className="text-lg font-medium text-[rgb(var(--text-sec))]">{stat.unit}</span>
                          </div>
                      </div>
                      <div className={`p-4 rounded-2xl ${stat.bg} border ${stat.border}`}>
                          <stat.icon size={28} className={stat.color} />
                      </div>
                  </div>
              </motion.div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* --- LEADERBOARD & GAMIFICATION --- */}
          <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-3xl p-6 md:p-8 relative overflow-hidden">
             
             <div className="flex justify-between items-center mb-8">
                 <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Trophy className="text-amber-400" /> Block Leaderboard
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">Which building is saving the most energy?</p>
                 </div>
                 
                 {/* Mini 3D Trophy Context */}
                 <div className="w-24 h-24 absolute top-2 right-4 hidden sm:block opacity-80 pointer-events-none">
                     <Canvas camera={{ position: [0, 0, 4] }}>
                         <ambientLight intensity={0.7} />
                         <directionalLight position={[5, 5, 5]} intensity={1.5} />
                         <Trophy3D />
                     </Canvas>
                 </div>
             </div>

             <div className="space-y-4">
                 {HOSTEL_RANKINGS.map((block, i) => (
                     <motion.div 
                        key={block.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + (i * 0.1) }}
                        whileHover={{ scale: 1.02, translateX: 5 }}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                            i === 0 
                                ? 'bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                                : 'bg-[rgb(var(--bg-input))] border-transparent hover:border-[rgb(var(--border))]'
                        }`}
                     >
                         <div className="flex items-center space-x-4">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                                 i === 0 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/40' : 
                                 i === 1 ? 'bg-slate-300 text-slate-800' : 
                                 i === 2 ? 'bg-amber-700 text-white' : 
                                 'bg-slate-800 text-slate-400'
                             }`}>
                                 #{i + 1}
                             </div>
                             <div>
                                 <h3 className={`font-bold ${i===0 ? 'text-amber-400' : 'text-[rgb(var(--text-main))]'}`}>
                                     {block.name}
                                 </h3>
                                 <div className="flex items-center space-x-3 text-xs text-[rgb(var(--text-muted))] mt-1">
                                     <span className="flex items-center gap-1"><Zap size={12} className="text-emerald-400"/> {block.saved} saved</span>
                                     <span>•</span>
                                     <span className="flex items-center gap-1">Score: {block.score}/100</span>
                                 </div>
                             </div>
                         </div>
                         {block.icon && (
                             <block.icon size={24} className={`${block.color} opacity-80`} />
                         )}
                     </motion.div>
                 ))}
             </div>
          </div>

          {/* --- CROWDSOURCED REPORTING PORTAL --- */}
          <div className="bg-gradient-to-br from-slate-900 via-[rgb(var(--bg-card))] to-slate-900 border border-[rgb(var(--border))] rounded-3xl p-6 md:p-8 relative overflow-hidden group">
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
              
              <div className="relative z-10">
                 <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                     <Users className="text-blue-400" /> Campus Watch
                 </h2>
                 <p className="text-sm text-slate-400 mb-8 border-b border-white/5 pb-6">
                     Notice lights left on in an empty classroom? A running AC in the lab? Report it anonymously and earn Green Points. 
                 </p>

                 <form onSubmit={handleReportSubmit} className="space-y-5">
                     <div>
                         <label className="block text-xs font-semibold text-[rgb(var(--text-sec))] uppercase tracking-wider mb-2">Issue Type</label>
                         <div className="grid grid-cols-3 gap-3">
                             {['electricity', 'water', 'appliance'].map(type => (
                                 <button
                                     key={type}
                                     type="button"
                                     onClick={() => setReportType(type)}
                                     className={`py-3 px-2 rounded-xl border text-sm font-medium transition-all ${
                                         reportType === type 
                                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                                            : 'bg-[rgb(var(--bg-input))] border-transparent text-[rgb(var(--text-muted))] hover:bg-slate-800'
                                     }`}
                                 >
                                     {type.charAt(0).toUpperCase() + type.slice(1)}
                                 </button>
                             ))}
                         </div>
                     </div>

                     <div>
                         <label className="block text-xs font-semibold text-[rgb(var(--text-sec))] uppercase tracking-wider mb-2">Location / Room Number</label>
                         <div className="relative border border-[rgb(var(--border))] rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                               <Search className="h-5 w-5 text-[rgb(var(--text-muted))]" />
                            </div>
                            <input 
                                type="text"
                                required
                                value={reportLocation}
                                onChange={(e) => setReportLocation(e.target.value)}
                                placeholder="e.g. Lab 402, Block C Restroom..."
                                className="w-full bg-[rgb(var(--bg-input))] pl-11 pr-4 py-4 text-[rgb(var(--text-main))] focus:outline-none placeholder:text-[rgb(var(--text-muted))]/50"
                            />
                         </div>
                     </div>

                     <button 
                         type="submit"
                         disabled={isSubmitting || !reportLocation}
                         className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn overflow-hidden relative"
                     >
                         {isSubmitting ? (
                             <span className="animate-pulse">Transmitting to Admins...</span>
                         ) : (
                             <>
                                 <span className="relative z-10">Report Wastage Anonymously</span>
                                 <Send size={18} className="relative z-10 group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1 transition-transform" />
                             </>
                         )}
                     </button>
                     <p className="text-center text-xs text-emerald-400/80 font-mono mt-4">+50 Points per valid report</p>
                 </form>
              </div>
          </div>
      </div>

    </div>
  );
};

// Reusable icons missing from import
function Shield(props) {
  return <Users {...props} />;
}

export default Impact;
