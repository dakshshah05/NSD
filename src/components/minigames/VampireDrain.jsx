import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder, Sphere, useCursor, Text, SpotLight, Plane } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Power, Timer, Award, RotateCcw, AlertCircle } from 'lucide-react';
import { fetchRoomStatus } from '../../data/historicalData';
import { supabase } from '../../lib/supabaseClient';

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
      
      <Text 
        position={[0, args[1] + 0.3, 0]} 
        fontSize={0.25} 
        color={isFound ? "#10b981" : (hovered ? "#fca5a5" : "#cbd5e1")} 
        anchorX="center" 
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor="#000000"
        fillOpacity={isFound ? 1 : 0.8}
      >
        {isFound ? "OFF" : name}
      </Text>
    </group>
  );
};

// Flashlight tied to mouse position
const Flashlight = () => {
    const lightRef = useRef();
    const { pointer, viewport } = useThree();
  
    useFrame(() => {
      if (lightRef.current) {
        // Map pointer coordinates to a wider range
        const x = (pointer.x * viewport.width);
        const y = (pointer.y * viewport.height);
        
        // Position the point light at the cursor's world X/Y but pushed into the screen Z
        lightRef.current.position.set(x, y + 2, 2.5);
      }
    });
  
    return (
      <pointLight
        ref={lightRef}
        color="#ffffff"
        intensity={12}
        distance={15}
        decay={1.8}
        castShadow
      />
    );
};

const INITIAL_DEVICES = [
    { id: 1, name: 'Main Lights', power: 45, type: 'box', args: [1.2, 0.4, 0.2], position: [0, 2, -3.8], color: '#cbd5e1' },
    { id: 2, name: 'Ceiling Fan', power: 35, type: 'cylinder', args: [0.8, 0.8, 0.1, 32], position: [0, 2.5, 0], color: '#f8fafc' },
    { id: 3, name: 'Projector', power: 60, type: 'box', args: [0.6, 0.3, 0.6], position: [0, 2.2, 0], color: '#334155' },
    { id: 4, name: 'Teacher PC', power: 25, type: 'box', args: [1.0, 0.6, 0.1], position: [-2, -0.1, -3.7], color: '#f8fafc' },
    { id: 5, name: 'AC Unit', power: 120, type: 'box', args: [1.5, 0.5, 0.4], position: [0, 2, -4.8], color: '#cbd5e1' },
    { id: 6, name: 'Smart Board', power: 45, type: 'box', args: [3.5, 2.0, 0.1], position: [0, 0.5, -4.9], color: '#fff' },
];
const VampireDrain = ({ onBack }) => {
    const [gameState, setGameState] = useState('start'); // start, loading, no_loads, playing, gameover
    const [availableRooms, setAvailableRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [devices, setDevices] = useState([]);
    const [timeLeft, setTimeLeft] = useState(GAME_TIME);
    const [score, setScore] = useState(0);

    // Memos for easy checking
    const allFound = devices.length > 0 && devices.every(d => d.found);

    useEffect(() => {
        // Load available rooms on mount
        const loadRooms = async () => {
            setGameState('loading');
            try {
                const rooms = await fetchRoomStatus();
                // Find rooms wasting energy
                const wastingRooms = rooms.filter(r => r.lights || r.fans);
                if (wastingRooms.length === 0) {
                    setGameState('no_loads');
                } else {
                    setAvailableRooms(wastingRooms);
                    setGameState('start'); // Let the user pick a room
                }
            } catch (error) {
                console.error("Failed to load real life rooms:", error);
                setGameState('start'); 
            }
        };
        loadRooms();
    }, []);

    const startGame = async (room) => {
        setSelectedRoom(room);
        
        let activeDevices = [];
        
        if (room.lights && room.fans) {
            // Spawn one for lights, one for fans
            activeDevices.push({ ...INITIAL_DEVICES[0], id: `${room.id}-lights`, realRoomId: room.id, realRoomName: room.name, typeTarget: 'lights', found: false });
            activeDevices.push({ ...INITIAL_DEVICES[1], id: `${room.id}-fans`, realRoomId: room.id, realRoomName: room.name, typeTarget: 'fans', found: false });
        } else if (room.lights) {
            activeDevices.push({ ...INITIAL_DEVICES[0], id: `${room.id}-lights`, realRoomId: room.id, realRoomName: room.name, typeTarget: 'lights', found: false });
            activeDevices.push({ ...INITIAL_DEVICES[5], id: `${room.id}-board`, realRoomId: room.id, realRoomName: room.name, typeTarget: 'lights', found: false }); 
        } else if (room.fans) {
            activeDevices.push({ ...INITIAL_DEVICES[1], id: `${room.id}-fans`, realRoomId: room.id, realRoomName: room.name, typeTarget: 'fans', found: false });
        }

        setDevices(activeDevices);
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

    const handleUnplug = async (id, power) => {
        if (gameState !== 'playing') return;
        
        // Optimistically update UI
        setDevices(prev => prev.map(d => d.id === id ? { ...d, found: true } : d));
        setScore(s => s + power);

        // ACTUALLY Turn it off in real life (Supabase)
        const targetDevice = devices.find(d => d.id === id);
        if (targetDevice && targetDevice.realRoomId) {
            try {
                const updatePayload = {};
                if (targetDevice.typeTarget === 'lights') updatePayload.lights = false;
                if (targetDevice.typeTarget === 'fans') updatePayload.fans = false;

                await supabase
                    .from('room_status')
                    .update(updatePayload)
                    .eq('id', targetDevice.realRoomId);
                    
                console.log(`Successfully turned off ${targetDevice.typeTarget} in ${targetDevice.realRoomName} via Vampire Drain 3D!`);
            } catch (error) {
                console.error("Failed to update real life switch:", error);
            }
        }
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
            <div className="relative overflow-hidden bg-black cursor-crosshair h-[700px] w-full">
                
                {/* Intro Screen */}
                {gameState === 'start' && (
                    <div className="absolute inset-0 flex items-center justify-center z-30 bg-slate-900/80 backdrop-blur-md">
                        <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-2xl text-center shadow-2xl backdrop-blur-md">
                            <Power size={64} className="text-purple-500 mx-auto mb-6 flex-shrink-0" />
                            <h3 className="text-3xl font-black text-white mb-2">Simulate Physical Rooms</h3>
                            <p className="text-slate-300 mb-6 leading-relaxed max-w-lg mx-auto">
                                The following rooms on campus currently have their lights or fans running completely empty. Choose a room to virtually enter it and manually override the physical smart switches to shut off the loads.
                            </p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8 max-h-48 overflow-y-auto p-2 pr-4 custom-scrollbar">
                                {availableRooms.map(room => (
                                    <button 
                                        key={room.id}
                                        onClick={() => startGame(room)}
                                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl text-left transition-all group flex flex-col justify-center items-center text-center"
                                    >
                                        <p className="font-bold text-white group-hover:text-purple-400">{room.name}</p>
                                        <p className="text-xs text-slate-400">{room.lights && room.fans ? 'Lights & Fans ON' : (room.lights ? 'Lights ON' : 'Fans ON')}</p>
                                    </button>
                                ))}
                                {availableRooms.length === 0 && (
                                    <div className="col-span-full py-8 text-slate-500 italic">No rooms available for simulation (Database fetch failed or no rooms to show).</div>
                                )}
                            </div>

                            <div className="flex justify-center gap-4">
                                <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all w-full md:w-auto mt-2">
                                    Exit Simulator
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
                                <button onClick={() => setGameState('start')} className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
                                    <RotateCcw size={20} /> Select Another Room
                                </button>
                                <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all">
                                    Back to Hub
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State or No Loads State */}
                {gameState === 'loading' && (
                    <div className="absolute inset-0 flex items-center justify-center z-30 bg-slate-900/80 backdrop-blur-md">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-white font-bold animate-pulse">Scanning Campus Rooms...</p>
                        </div>
                    </div>
                )}

                {gameState === 'no_loads' && (
                    <div className="absolute inset-0 flex items-center justify-center z-30 bg-slate-900/80 backdrop-blur-md">
                        <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-lg text-center shadow-2xl backdrop-blur-md">
                            <AlertCircle size={64} className="text-emerald-500 mx-auto mb-6" />
                            <h3 className="text-3xl font-black text-white mb-4">You did it!</h3>
                            <p className="text-slate-300 mb-8 leading-relaxed">
                                Our campus is incredibly efficient right now. There are NO rooms currently wasting power with lights or fans left on.
                                <br/><br/>
                                Check back later to see if any new phantom loads appear.
                            </p>
                            <button onClick={onBack} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-all w-full">
                                Back to Hub
                            </button>
                        </div>
                    </div>
                )}

                {/* 3D Scene */}
                <Canvas 
                    shadows 
                    camera={{ position: [0, 0, 10], fov: 40 }}
                    style={{ background: '#000' }}
                >
                    {/* Dim ambient light for silhouette visibility */}
                    <ambientLight intensity={0.4} />
                    
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
                        enablePan={true} 
                        enableZoom={true} 
                        minDistance={3}
                        maxDistance={15}
                        makeDefault
                    />
                </Canvas>
            </div>
        </div>
    );
};

export default VampireDrain;
