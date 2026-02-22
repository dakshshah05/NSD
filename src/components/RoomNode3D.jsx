import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, MeshDistortMaterial } from '@react-three/drei';

const NodeElement = ({ status }) => {
    const meshRef = useRef();

    // Map status to colors
    const colors = {
        'Occupied': '#ef4444', // Red (High usage)
        'Empty_On': '#f59e0b', // Amber (Wastage)
        'Empty_Off': '#10b981', // Green (Efficient)
        'Maintenance': '#3b82f6' // Blue
    };

    const nodeColor = colors[status] || '#10b981';

    useFrame((state) => {
        meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
        // Pulse scale slightly
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
        meshRef.current.scale.set(scale, scale, scale);
    });

    return (
        <Icosahedron ref={meshRef} args={[1.5, 2]}>
            <MeshDistortMaterial
                color={nodeColor}
                envMapIntensity={1}
                clearcoat={1}
                clearcoatRoughness={0.1}
                metalness={0.5}
                roughness={0.2}
                distort={0.4}
                speed={2}
                emissive={nodeColor}
                emissiveIntensity={0.8}
            />
        </Icosahedron>
    )
}

const RoomNode3D = ({ status }) => {
  return (
    <div className="absolute -right-4 -bottom-4 w-32 h-32 opacity-80 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
          <ambientLight intensity={1} />
          <directionalLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
          <NodeElement status={status} />
      </Canvas>
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[rgb(var(--bg-card))] pointer-events-none blur-sm" style={{mixBlendMode: 'multiply'}}></div>
    </div>
  );
};

export default RoomNode3D;
