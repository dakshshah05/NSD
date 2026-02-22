import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, MeshTransmissionMaterial, Float, Stars } from '@react-three/drei';

const BrainNode = () => {
    const meshRef = useRef();

    useFrame((state) => {
        meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    });

    return (
        <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
            <Icosahedron ref={meshRef} args={[2, 0]} >
                <meshStandardMaterial 
                   color="#a78bfa" // violet-400
                   wireframe 
                   transparent 
                   opacity={0.3} 
                />
            </Icosahedron>
            <Icosahedron args={[1.5, 2]}>
                <MeshTransmissionMaterial 
                   backside 
                   samples={4} 
                   thickness={1} 
                   chromaticAberration={0.025} 
                   anisotropy={0.1} 
                   distortion={0.1} 
                   distortionScale={0.1} 
                   temporalDistortion={0.2} 
                   color="#c084fc" 
                />
            </Icosahedron>
        </Float>
    )
}

const AIBrain3D = () => {
  return (
    <div className="absolute right-0 top-0 h-full w-full md:w-1/2 opacity-70 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <ambientLight intensity={1} />
          <directionalLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
          <pointLight position={[-10, -10, -10]} intensity={5} color="#818cf8" />
          <BrainNode />
          <Stars radius={10} count={500} factor={2} color="#fcd34d" fade speed={1} />
      </Canvas>
      {/* Fade mask into the banner color */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-transparent"></div>
    </div>
  );
};

export default AIBrain3D;
