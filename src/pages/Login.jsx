import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import { Mail, Lock, LogIn, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InteractiveNebula = () => {
    const pointsRef = useRef();
    
    useFrame((state) => {
      const time = state.clock.getElapsedTime();
      if (pointsRef.current) {
        pointsRef.current.rotation.y = time * 0.05;
        pointsRef.current.rotation.z = time * 0.03;
        
        // Tilt based on mouse
        const mouseX = state.mouse.x * 0.5;
        const mouseY = state.mouse.y * 0.5;
        pointsRef.current.rotation.x += (mouseY - pointsRef.current.rotation.x) * 0.05;
        pointsRef.current.rotation.y += (mouseX - pointsRef.current.rotation.y) * 0.05;
      }
    });
  
    // Create random particles
    const particlesCount = 2000;
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 20;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
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
          size={0.05} 
          color="#6366f1" 
          transparent 
          opacity={0.6} 
          sizeAttenuation 
          blending={3} // AdditiveBlending
        />
      </points>
    );
};

const ThreeBackground = () => {
  return (
    <div className="absolute inset-0 z-0 bg-slate-950 pointer-events-none overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#818cf8" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#c084fc" />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={2} />
        <InteractiveNebula />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
             <mesh position={[4, 2, -5]} rotation={[0, 0, Math.PI / 4]}>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#818cf8" wireframe emissive="#818cf8" emissiveIntensity={0.5} />
             </mesh>
        </Float>
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_70%)]" />
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]" />
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await login(email, password);
      if (error) throw error;
      
      addNotification('Success', 'Access Granted. Welcome to the Command Center.');
      navigate('/');
    } catch (err) {
      setError('Authentication failed. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-inter selection:bg-emerald-500/30">
      <ThreeBackground />
      
      {/* Login Card Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-[1px] rounded-[2.5rem] bg-gradient-to-br from-emerald-500/20 via-transparent to-emerald-500/10 shadow-[0_0_50px_rgba(0,0,0,0.15)]"
      >
        <div 
          style={{ 
            backgroundColor: 'rgba(var(--glass-bg), var(--glass-opacity))',
            borderColor: 'rgba(var(--glass-border), var(--glass-border-opacity))'
          }}
          className="w-full h-full p-10 rounded-[2.5rem] backdrop-blur-[30px] border relative overflow-hidden group"
        >
          
          {/* Animated Glow Effect */}
          <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(var(--accent),0.03),transparent_50%)] animate-pulse pointer-events-none" />

          <div className="text-center mb-10 relative">
            <motion.div 
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="w-20 h-20 bg-[rgb(var(--accent))]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[rgb(var(--accent))]/30 group-hover:border-[rgb(var(--accent))]/50 transition-colors shadow-[0_0_30px_rgba(var(--accent),0.1)]"
            >
              <LogIn className="w-10 h-10 text-[rgb(var(--accent))] group-hover:text-[rgb(var(--accent-dark))] transition-all filter drop-shadow-[0_0_8px_rgba(var(--accent),0.4)]" />
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-black text-[rgb(var(--text-main))] tracking-tight mb-2"
            >
              System <span className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--accent))] to-emerald-600">Entry</span>
            </motion.h2>
            <p className="text-[rgb(var(--text-muted))] font-medium tracking-wide flex items-center justify-center gap-2">
               Initialize Session <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--accent))] animate-pulse" />
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold p-4 rounded-2xl mb-8 flex items-center gap-3"
              >
                <div className="w-1 h-1 rounded-full bg-red-400 animate-ping" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6 relative">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-5"
            >
              <div className="group relative">
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
                  placeholder="Network ID (Email)"
                />
              </div>
              
              <div className="group relative">
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
                  className="block w-full pl-12 pr-12 py-4 border rounded-2xl text-[rgb(var(--text-main))] placeholder-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/30 focus:border-[rgb(var(--accent))]/50 sm:text-sm transition-all hover:bg-[rgb(var(--input-bg))]/[0.08]"
                  placeholder="Security Key"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(var(--accent),0.3)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 border border-[rgb(var(--accent))]/30 text-base font-bold rounded-2xl text-white bg-gradient-to-r from-[rgb(var(--accent-dark))] to-emerald-600 hover:from-[rgb(var(--accent))] hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-shimmer" />
              <span className="flex items-center gap-2">
                {loading ? 'Authenticating...' : 'Establish Connection'}
                {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </span>
            </motion.button>
          </form>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 text-center"
          >
            <p className="text-sm font-medium text-[rgb(var(--text-muted))]">
              New to the system?{' '}
              <Link to="/register" className="text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-dark))] transition-colors hover:underline decoration-2 underline-offset-4">
                Register Credentials
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
