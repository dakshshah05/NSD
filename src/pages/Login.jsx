import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, PerspectiveCamera } from '@react-three/drei';
import { Mail, Lock, LogIn, ArrowRight, Eye, EyeOff } from 'lucide-react';

const AnimatedTorus = () => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float
      speed={1.5}
      rotationIntensity={1}
      floatIntensity={2}
      floatingRange={[1, 1.5]}
    >
      <mesh ref={meshRef} position={[2, 0, -5]}>
        <torusGeometry args={[2, 0.5, 16, 100]} />
        <meshStandardMaterial
          color="#10b981"
          wireframe
          emissive="#10b981"
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
};

const AnimatedSphere = () => {
    const meshRef = useRef();
  
    useFrame((state, delta) => {
      if (meshRef.current) {
        meshRef.current.rotation.x -= delta * 0.1;
        meshRef.current.rotation.y -= delta * 0.2;
      }
    });
  
    return (
      <Float
        speed={1}
        rotationIntensity={1}
        floatIntensity={2}
        floatingRange={[-1, 1.5]}
      >
        <mesh ref={meshRef} position={[-4, -2, -8]}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshStandardMaterial
            color="#3b82f6"
            wireframe
            emissive="#3b82f6"
            emissiveIntensity={0.3}
          />
        </mesh>
      </Float>
    );
};

const ThreeBackground = () => {
  return (
    <div className="absolute inset-0 z-0 bg-slate-950 pointer-events-none overflow-hidden">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#10b981" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <AnimatedTorus />
        <AnimatedSphere />
      </Canvas>
      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-transparent to-slate-900/80" />
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
      
      addNotification('Success', 'Successfully logged in to EnergyGuard.');
      navigate('/');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <ThreeBackground />
      
      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 m-4 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            <LogIn className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-emerald-400/80 mt-2 text-sm">Sign in to EnergyGuard Dashboard</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 sm:text-sm transition-all"
                placeholder="Email address"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 sm:text-sm transition-all"
                placeholder="Password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
          >
            <span className="absolute right-0 inset-y-0 flex items-center pr-3 translate-x-8 group-hover:-translate-x-2 transition-transform duration-300">
              <ArrowRight className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
