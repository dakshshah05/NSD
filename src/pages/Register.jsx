import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import { Mail, Lock, UserPlus, ArrowRight, Eye, EyeOff, User, Shield, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InteractiveNebula = () => {
    const pointsRef = useRef();
    
    useFrame((state) => {
      const time = state.clock.getElapsedTime();
      if (pointsRef.current) {
        pointsRef.current.rotation.y = time * 0.04;
        pointsRef.current.rotation.z = time * 0.02;
        
        const mouseX = state.mouse.x * 0.4;
        const mouseY = state.mouse.y * 0.4;
        pointsRef.current.rotation.x += (mouseY - pointsRef.current.rotation.x) * 0.05;
        pointsRef.current.rotation.y += (mouseX - pointsRef.current.rotation.y) * 0.05;
      }
    });
  
    const particlesCount = 2500;
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 25;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
  
    return (
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            count={particlesCount} 
            array={pos} 
            itemSize={3} 
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.04} 
          color="#22d3ee" 
          transparent 
          opacity={0.5} 
          sizeAttenuation 
          blending={3}
        />
      </points>
    );
};

const ThreeBackground = () => {
    return (
      <div className="absolute inset-0 z-0 bg-slate-950 pointer-events-none overflow-hidden">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#22d3ee" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#6366f1" />
          <Stars radius={100} depth={50} count={4000} factor={4} saturation={0} fade speed={1.5} />
          <InteractiveNebula />
          <Float speed={3} rotationIntensity={1} floatIntensity={2}>
               <mesh position={[-5, -2, -6]} rotation={[Math.PI / 4, 0, 0]}>
                  <icosahedronGeometry args={[1.5, 0]} />
                  <meshStandardMaterial color="#22d3ee" wireframe emissive="#22d3ee" emissiveIntensity={0.6} />
               </mesh>
          </Float>
        </Canvas>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.1),transparent_60%)]" />
        <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px]" />
      </div>
    );
};

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match. Integrity check failed.');
    }

    setLoading(true);

    try {
      const { error } = await register(email, password, role);
      if (error) throw error;
      
      addNotification('Success', 'Profile Initialized. You may now connect to the network.');
      navigate('/login');
    } catch (err) {
        if (err.message.includes('already registered')) {
            setError('Entity already exists in the registry.');
        } else {
            setError('Registry initialization failed. Try again.');
        }
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.6, 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-inter selection:bg-cyan-500/30">
      <ThreeBackground />
      
      {/* Register Card */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 w-full max-w-lg p-[1px] m-4 rounded-[3rem] bg-gradient-to-br from-cyan-500/20 via-transparent to-indigo-500/20 shadow-2xl"
      >
        <div className="w-full h-full p-10 rounded-[3rem] bg-slate-950/50 backdrop-blur-[40px] border border-white/5 relative overflow-hidden group">
          
          <div className="text-center mb-10 relative">
            <motion.div 
              variants={itemVariants}
              className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)] group-hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] transition-all"
            >
              <UserPlus className="w-8 h-8 text-cyan-400 filter drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl font-black text-white tracking-tight mb-2">Initialize <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Profile</span></motion.h2>
            <motion.p variants={itemVariants} className="text-cyan-400/60 font-medium tracking-widest text-xs uppercase">New Node Registration Protocol</motion.p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold p-4 rounded-2xl mb-8 text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div variants={itemVariants} className="space-y-4">
              <label className="text-[10px] font-bold text-cyan-400/40 uppercase tracking-[0.2em] ml-2">Access Level Configuration</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'student', icon: User, label: 'Student' },
                  { id: 'teacher', icon: Shield, label: 'Teacher' },
                  { id: 'admin', icon: Activity, label: 'Admin' }
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`group/role relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                      role === r.id 
                      ? 'bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
                      : 'bg-white/[0.02] border-white/5 grayscale hover:grayscale-0 hover:bg-white/[0.05] hover:border-cyan-500/20'
                    }`}
                  >
                    <r.icon className={`w-6 h-6 mb-2 transition-colors ${role === r.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className={`text-[9px] uppercase tracking-wider font-black ${role === r.id ? 'text-cyan-400' : 'text-slate-600'}`}>{r.label}</span>
                    {role === r.id && <div className="absolute -bottom-1 w-1/2 h-[2px] bg-cyan-400 rounded-full" />}
                  </button>
                ))}
              </div>
            </motion.div>

            <div className="space-y-4">
              <motion.div variants={itemVariants} className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-cyan-400/50 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border border-white/5 rounded-2xl bg-white/[0.03] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 sm:text-sm transition-all hover:bg-white/[0.05]"
                  placeholder="Network Identity (Email)"
                />
              </motion.div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div variants={itemVariants} className="group relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-cyan-400/50 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-10 py-4 border border-white/5 rounded-2xl bg-white/[0.03] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 sm:text-sm transition-all hover:bg-white/[0.05]"
                    placeholder="Security Key"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-cyan-400 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </motion.div>

                <motion.div variants={itemVariants} className="group relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-cyan-400/50 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-12 pr-10 py-4 border border-white/5 rounded-2xl bg-white/[0.03] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 sm:text-sm transition-all hover:bg-white/[0.05]"
                    placeholder="Confirm Key"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-cyan-400 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </motion.div>
              </div>
            </div>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(34,211,238,0.4)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 border border-cyan-500/30 text-base font-black uppercase tracking-widest rounded-2xl text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-shimmer" />
              <span className="flex items-center gap-3">
                {loading ? 'Processing...' : 'Register Node'}
                {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </span>
            </motion.button>
          </form>

          <motion.div 
            variants={itemVariants}
            className="mt-10 text-center"
          >
            <p className="text-sm font-medium text-slate-500">
              Already registered?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors font-bold underline decoration-2 underline-offset-4 decoration-cyan-400/30 hover:decoration-cyan-400">
                Establish Connection
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
