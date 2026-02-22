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
        className="relative z-10 w-full max-w-lg p-[1px] m-4 rounded-[3rem] bg-gradient-to-br from-[rgb(var(--accent))]/20 via-transparent to-[rgb(var(--accent))]/10 shadow-2xl"
      >
        <div 
          style={{ 
            backgroundColor: 'rgba(var(--glass-bg), var(--glass-opacity))',
            borderColor: 'rgba(var(--glass-border), var(--glass-border-opacity))'
          }}
          className="w-full h-full p-10 rounded-[3rem] backdrop-blur-[40px] border relative overflow-hidden group"
        >
          
          <div className="text-center mb-10 relative">
            <motion.div 
              variants={itemVariants}
              className="w-16 h-16 bg-[rgb(var(--accent))]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[rgb(var(--accent))]/30 shadow-[0_0_20px_rgba(var(--accent),0.1)] group-hover:shadow-[0_0_40px_rgba(var(--accent),0.2)] transition-all"
            >
              <UserPlus className="w-8 h-8 text-[rgb(var(--accent))] filter drop-shadow-[0_0_5px_rgba(var(--accent),0.6)]" />
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl font-black text-[rgb(var(--text-main))] tracking-tight mb-2">Initialize <span className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--accent))] to-emerald-600">Profile</span></motion.h2>
            <motion.p variants={itemVariants} className="text-[rgb(var(--accent))]/60 font-medium tracking-widest text-xs uppercase">New Node Registration Protocol</motion.p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold p-4 rounded-2xl mb-8 text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div variants={itemVariants} className="space-y-4">
              <label className="text-[10px] font-bold text-[rgb(var(--accent))]/40 uppercase tracking-[0.2em] ml-2">Access Level Configuration</label>
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
                      ? 'bg-[rgb(var(--accent))]/20 border-[rgb(var(--accent))]/50 shadow-[0_0_20px_rgba(var(--accent),0.2)]' 
                      : 'bg-[rgb(var(--text-main))]/[0.02] border-[rgb(var(--text-main))]/5 grayscale hover:grayscale-0 hover:bg-[rgb(var(--text-main))]/[0.05] hover:border-[rgb(var(--accent))]/20'
                    }`}
                  >
                    <r.icon className={`w-6 h-6 mb-2 transition-colors ${role === r.id ? 'text-[rgb(var(--accent))]' : 'text-[rgb(var(--text-muted))]'}`} />
                    <span className={`text-[9px] uppercase tracking-wider font-black ${role === r.id ? 'text-[rgb(var(--accent))]' : 'text-[rgb(var(--text-muted))]'}`}>{r.label}</span>
                    {role === r.id && <div className="absolute -bottom-1 w-1/2 h-[2px] bg-[rgb(var(--accent))] rounded-full" />}
                  </button>
                ))}
              </div>
            </motion.div>

            <div className="space-y-4">
              <motion.div variants={itemVariants} className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[rgb(var(--accent))]/50 group-focus-within:text-[rgb(var(--accent))] transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ 
                    backgroundColor: 'rgba(var(--input-bg), var(--input-opacity))',
                    borderColor: 'rgba(var(--glass-border), var(--glass-border-opacity))'
                  }}
                  className="block w-full pl-12 pr-4 py-4 border rounded-2xl text-[rgb(var(--text-main))] placeholder-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/30 focus:border-[rgb(var(--accent))]/50 sm:text-sm transition-all hover:bg-[rgb(var(--input-bg))]/[0.08]"
                  placeholder="Network Identity (Email)"
                />
              </motion.div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div variants={itemVariants} className="group relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[rgb(var(--accent))]/50 group-focus-within:text-[rgb(var(--accent))] transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ 
                      backgroundColor: 'rgba(var(--input-bg), var(--input-opacity))',
                      borderColor: 'rgba(var(--glass-border), var(--glass-border-opacity))'
                    }}
                    className="block w-full pl-12 pr-10 py-4 border rounded-2xl text-[rgb(var(--text-main))] placeholder-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/30 focus:border-[rgb(var(--accent))]/50 sm:text-sm transition-all hover:bg-[rgb(var(--input-bg))]/[0.08]"
                    placeholder="Security Key"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </motion.div>

                <motion.div variants={itemVariants} className="group relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[rgb(var(--accent))]/50 group-focus-within:text-[rgb(var(--accent))] transition-colors" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ 
                      backgroundColor: 'rgba(var(--input-bg), var(--input-opacity))',
                      borderColor: 'rgba(var(--glass-border), var(--glass-border-opacity))'
                    }}
                    className="block w-full pl-12 pr-10 py-4 border rounded-2xl text-[rgb(var(--text-main))] placeholder-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/30 focus:border-[rgb(var(--accent))]/50 sm:text-sm transition-all hover:bg-[rgb(var(--input-bg))]/[0.08]"
                    placeholder="Confirm Key"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </motion.div>
              </div>
            </div>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(var(--accent),0.3)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 border border-[rgb(var(--accent))]/30 text-base font-black uppercase tracking-widest rounded-2xl text-white bg-gradient-to-r from-[rgb(var(--accent-dark))] to-emerald-600 hover:from-[rgb(var(--accent))] hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-xl"
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
            <p className="text-sm font-medium text-[rgb(var(--text-muted))]">
              Already registered?{' '}
              <Link to="/login" className="text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-dark))] transition-colors font-bold underline decoration-2 underline-offset-4 decoration-[rgb(var(--accent))]/30 hover:decoration-[rgb(var(--accent))]">
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
