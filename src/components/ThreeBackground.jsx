import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

const Particles = ({ count = 200 }) => {
  const mesh = useRef();
  const { isDarkMode } = useTheme();

  // Generate random positions
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 40;
        const y = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 40;
        const speed = 0.01 + Math.random() * 0.02;
        const factor = 0.1 + Math.random();
        temp.push({ t: Math.random() * 100, factor, speed, x, y, z });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, x, y, z } = particle;
      // Update time
      t = particle.t += speed / 2;
      // Make them float around gently
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      
      dummy.position.set(x + a, y + b, z);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    
    // Slowly rotate the entire system
    mesh.current.rotation.y = state.clock.elapsedTime * 0.05;
    mesh.current.rotation.z = state.clock.elapsedTime * 0.02;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color={isDarkMode ? '#3b82f6' : '#10b981'} transparent opacity={isDarkMode ? 0.4 : 0.8} />
    </instancedMesh>
  );
};

const ThreeBackground = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {isDarkMode && (
        <>
          <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
            <ambientLight intensity={0.5} />
            {/* Subtle base stars */}
            <Stars 
                radius={50} 
                depth={50} 
                count={3000} 
                factor={3} 
                saturation={0} 
                fade 
                speed={0.5} 
            />
            {/* Larger glowing floating motes */}
            <Particles count={150} />
          </Canvas>
          {/* Light overlay gradient to ensure UI readability over the 3D canvas */}
          <div 
             className="absolute inset-0" 
             style={{
                 background: 'radial-gradient(circle at center, transparent 0%, rgba(15,23,42, 0.8) 100%)' 
             }} 
          />
        </>
      )}
    </div>
  );
};

export default ThreeBackground;
