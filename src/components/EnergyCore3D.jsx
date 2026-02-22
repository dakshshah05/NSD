import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { TorusKnot, MeshDistortMaterial, Float, Environment, Lightformer } from '@react-three/drei';
import { useTheme } from '../context/ThemeContext';

const CoreShape = () => {
  const meshRef = useRef();
  const { isDarkMode } = useTheme();

  useFrame((state) => {
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <TorusKnot ref={meshRef} args={[1, 0.3, 128, 32]}>
        <MeshDistortMaterial
          color={isDarkMode ? "#10b981" : "#3b82f6"} // Emerald for dark mode, Blue for light
          envMapIntensity={2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.8}
          roughness={0.2}
          distort={0.4}
          speed={2}
          emissive={isDarkMode ? "#047857" : "#1d4ed8"}
          emissiveIntensity={0.5}
        />
      </TorusKnot>
    </Float>
  );
};

const Lighting = () => {
    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
            <spotLight position={[-10, -10, -10]} intensity={2} color="#10b981" />
            <Environment resolution={256}>
                <group rotation={[-Math.PI / 2, 0, 0]}>
                    <Lightformer form="circle" intensity={10} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={20} />
                </group>
            </Environment>
        </>
    )
}

const EnergyCore3D = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center relative">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
            <Lighting />
            <CoreShape />
        </Canvas>
      </div>
      {/* Decorative overlaid UI */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none z-10 drop-shadow-lg">
          <p className="font-mono text-xs text-[rgb(var(--text-main))] uppercase tracking-widest opacity-80 mb-1">System Core</p>
          <div className="h-px bg-gradient-to-r from-transparent via-[rgb(var(--text-main))] to-transparent w-24 mx-auto opacity-50 mb-1"></div>
          <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-[rgb(var(--text-main))] to-emerald-400">ONLINE</p>
      </div>
    </div>
  );
};

export default EnergyCore3D;
