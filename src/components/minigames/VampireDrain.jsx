import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder, Sphere, useCursor, Text, SpotLight, Plane } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Power, Timer, Award, RotateCcw } from 'lucide-react';

const GAME_TIME = 20;

const RoomModel = () => {
  return (
    <group>
      {/* Floor */}
      <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <meshStandardMaterial color="#2d3748" roughness={0.8} />
      </Plane>
      {/* Back Wall */}
      <Plane args={[10, 5]} position={[0, 0.5, -5]} receiveShadow>
        <meshStandardMaterial color="#4a5568" roughness={0.9} />
      </Plane>
      {/* Left Wall */}
      <Plane args={[10, 5]} rotation={[0, Math.PI / 2, 0]} position={[-5, 0.5, 0]} receiveShadow>
        <meshStandardMaterial color="#2d3748" roughness={0.9} />
      </Plane>
      {/* Right Wall */}
      <Plane args={[10, 5]} rotation={[0, -Math.PI / 2, 0]} position={[5, 0.5, 0]} receiveShadow>
        <meshStandardMaterial color="#2d3748" roughness={0.9} />
      </Plane>

      {/* Desk */}
      <Box args={[4, 0.2, 2]} position={[-2, -0.5, -3.8]} castShadow receiveShadow>
        <meshStandardMaterial color="#744210" roughness={0.7} />
      </Box>
      <Box args={[0.2, 1.5, 1.8]} position={[-3.8, -1.35, -3.8]} castShadow receiveShadow>
        <meshStandardMaterial color="#744210" roughness={0.7} />
      </Box>
      <Box args={[0.2, 1.5, 1.8]} position={[-0.2, -1.35, -3.8]} castShadow receiveShadow>
        <meshStandardMaterial color="#744210" roughness={0.7} />
      </Box>

      {/* TV Stand / Cabinet */}
      <Box args={[3, 1, 1.5]} position={[3, -1.5, -4]} castShadow receiveShadow>
        <meshStandardMaterial color="#1a202c" roughness={0.5} />
      </Box>

      {/* Rug */}
      <Cylinder args={[3, 3, 0.05, 32]} position={[0, -1.98, 0]} receiveShadow>
         <meshStandardMaterial color="#4a5568" />
      </Cylinder>
    </group>
  );
};

const InteractiveDevice = ({ id, position, args = [0.5, 0.5, 0.5], type = 'box', color = '#718096', activeColor = '#f56565', name, power, onUnplug, isFound }) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  // Bobbing animation for active items
  const ref = useRef();
  useFrame((state) => {
    if (!isFound && ref.current) {
        ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + id) * 0.05;
    }
  });

  return (
    <group position={position}>
      {type === 'box' && (
        <Box 
          ref={ref}
          args={args} 
          onClick={(e) => { e.stopPropagation(); if(!isFound) onUnplug(id, power); }}
          onPointerOver={() => !isFound && setHovered(true)}
          onPointerOut={() => setHovered(false)}
          castShadow 
          receiveShadow
        >
          <meshStandardMaterial 
            color={isFound ? '#2d3748' : (hovered ? activeColor : color)} 
            emissive={isFound ? '#000000' : activeColor}
            emissiveIntensity={isFound ? 0 : (hovered ? 0.8 : 0.4)}
          />
        </Box>
      )}
      {type === 'cylinder' && (
        <Cylinder 
          ref={ref}
          args={args} 
          onClick={(e) => { e.stopPropagation(); if(!isFound) onUnplug(id, power); }}
          onPointerOver={() => !isFound && setHovered(true)}
          onPointerOut={() => setHovered(false)}
          castShadow 
          receiveShadow
          rotation={[0, 0, Math.PI/2]}
        >
          <meshStandardMaterial 
             color={isFound ? '#2d3748' : (hovered ? activeColor : color)} 
             emissive={isFound ? '#000000' : activeColor}
             emissiveIntensity={isFound ? 0 : (hovered ? 0.8 : 0.4)}
          />
        </Cylinder>
      )}
      
      {!isFound && hovered && (
         <Text position={[0, args[1] + 0.4, 0]} fontSize={0.2} color="#fca5a5" anchorX="center" anchorY="bottom" outlineWidth={0.02} outlineColor="#000000">
             {name} ({power}W)
         </Text>
      )}
      {isFound && (
         <Text position={[0, args[1] + 0.4, 0]} fontSize={0.2} color="#10b981" anchorX="center" anchorY="bottom">
             UNPLUGGED
         </Text>
      )}
    </group>
  );
};

// Flashlight tied to mouse position
const Flashlight = () => {
    const lightRef = useRef();
    const { camera, pointer } = useThree();
  
    useFrame(() => {
      if (lightRef.current) {
        // Simple projection of mouse onto a plane at z=0 for the spotlight target
        lightRef.current.position.set(camera.position.x, camera.position.y, camera.position.z);
        lightRef.current.target.position.set(pointer.x * 5, pointer.y * 5, -5);
        lightRef.current.target.updateMatrixWorld();
      }
    });
  
    return (
      <SpotLight
        ref={lightRef}
        color="#ffffff"
        intensity={2}
        distance={20}
        angle={Math.PI / 6}
        penumbra={0.5}
        castShadow
      />
    );
};

const INITIAL_DEVICES = [
    { id: 1, name: 'Idle PC Monitor', power: 25, type: 'box', args: [1.2, 0.8, 0.1], position: [-2, -0.1, -3.7], color: '#cbd5e1' },
    { id: 2, name: 'Phone Charger', power: 5, type: 'box', args: [0.15, 0.15, 0.2], position: [-3.5, -0.4, -3.7], color: '#f8fafc' },
    { id: 3, name: 'TV on Standby', power: 15, type: 'box', args: [2.5, 1.4, 0.1], position: [3, 0.2, -3.8], color: '#334155' },
    { id: 4, name: 'Game Console', power: 12, type: 'box', args: [0.8, 0.2, 0.6], position: [2.5, -0.9, -3.8], color: '#f8fafc' },
    { id: 5, name: 'Coffee Maker', power: 8, type: 'cylinder', args: [0.3, 0.3, 0.6, 32], position: [-4.5, -1, 3], color: '#ef4444' },
    { id: 6, name: 'Space Heater', power: 45, type: 'box', args: [0.6, 0.8, 0.3], position: [4, -1.6, 2], color: '#fb923c' },
];

const VampireDrain = ({ onBack }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, gameover
    const [devices, setDevices] = useState(INITIAL_DEVICES.map(d => ({ ...d, found: false })));
    const [timeLeft, setTimeLeft] = useState(GAME_TIME);
    const [score, setScore] = useState(0);

    // Memos for easy checking
    const allFound = devices.every(d => d.found);

    const startGame = () => {
        setDevices(INITIAL_DEVICES.map(d => ({ ...d, found: false })));
        setTimeLeft(GAME_TIME);
        setScore(0);
        setGameState('playing');
    };

    useEffect(() => {
        if (gameState !== 'playing') return;

        if (timeLeft <= 0 || allFound) {
            setGameState('gameover');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(t => t - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, gameState, allFound]);

    const handleUnplug = (id, power) => {
        if (gameState !== 'playing') return;
        
        setDevices(prev => prev.map(d => d.id === id ? { ...d, found: true } : d));
        setScore(s => s + power);
    };

    return (
        <div className="flex flex-col min-h-[85vh] bg-slate-900 rounded-3xl overflow-hidden relative border border-slate-700 shadow-2xl">
            {/* Header */}
            <div className="bg-slate-950 p-6 flex justify-between items-center z-20 border-b border-slate-800">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Power className="text-purple-500" /> Vampire Drain Detective (3D)
                    </h2>
                    <p className="text-slate-400 text-sm">Explore the 3D room, find the glowing phantom loads, and unplug them!</p>
                </div>
                <div className="flex gap-6 text-right">
                    <div className="text-right">
                         <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Time</p>
                         <p className={`text-2xl font-mono font-black ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>00:{timeLeft.toString().padStart(2, '0')}</p>
                    </div>
                    <div className="text-right">
                         <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Watts Saved</p>
                         <p className="text-2xl font-mono font-black text-amber-400">{score}W</p>
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <div className="flex-1 relative overflow-hidden bg-black cursor-crosshair">
                
                {/* Intro Screen */}
                {gameState === 'start' && (
                    <div className="absolute inset-0 flex items-center justify-center z-30 bg-slate-900/80 backdrop-blur-md">
                        <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-lg text-center shadow-2xl backdrop-blur-md">
                            <Power size={64} className="text-purple-500 mx-auto mb-6" />
                            <h3 className="text-3xl font-black text-white mb-4">3D Vampire Room</h3>
                            <p className="text-slate-300 mb-8 leading-relaxed">
                                Use your mouse to aim the flashlight around the dark room. Navigate around the 3D environment by dragging.
                                <br/><br/>
                                Click on the red glowing devices to unplug them before {GAME_TIME} seconds run out!
                            </p>
                            <div className="flex justify-center gap-4">
                                <button onClick={startGame} className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
                                    <Power size={20} /> Enter Room
                                </button>
                                <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all">
                                    Exit
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Game Over Screen */}
                {gameState === 'gameover' && (
                    <div className="absolute inset-0 flex items-center justify-center z-30 bg-slate-950/90 backdrop-blur-md">
                        <div className="text-center animate-fade-in">
                            {allFound ? (
                                <Award size={80} className="text-emerald-500 mx-auto mb-6" />
                            ) : (
                                <Timer size={80} className="text-red-500 mx-auto mb-6" />
                            )}
                            <h3 className="text-4xl font-black text-white mb-2">
                                {allFound ? 'Room Cleared!' : 'Sun is Up!'}
                            </h3>
                            <p className="text-slate-400 text-lg mb-8">
                                You unplugged <span className="text-amber-400 font-bold">{score}W</span> of phantom loads in this room.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button onClick={startGame} className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
                                    <RotateCcw size={20} /> Another Round
                                </button>
                                <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all">
                                    Back to Hub
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3D Scene */}
                <Canvas shadows camera={{ position: [0, 2, 8], fov: 60 }}>
                    {/* Very dim ambient light so the room isn't pitch black, but still dark */}
                    <ambientLight intensity={0.1} />
                    
                    {/* Dynamic Flashlight that follows mouse */}
                    {gameState === 'playing' && <Flashlight />}

                    {/* Room Environment */}
                    <RoomModel />

                    {/* Interactive Devices */}
                    {devices.map(dev => (
                        <InteractiveDevice 
                            key={dev.id}
                            id={dev.id}
                            position={dev.position}
                            args={dev.args}
                            type={dev.type}
                            color={dev.color}
                            name={dev.name}
                            power={dev.power}
                            isFound={dev.found}
                            onUnplug={handleUnplug}
                        />
                    ))}

                    <OrbitControls 
                        enablePan={false} 
                        enableZoom={false} 
                        minAzimuthAngle={-Math.PI / 4} 
                        maxAzimuthAngle={Math.PI / 4}
                        minPolarAngle={Math.PI / 4}
                        maxPolarAngle={Math.PI / 2}
                    />
                </Canvas>
            </div>
        </div>
    );
};

export default VampireDrain;
