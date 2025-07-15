import React, { useRef, useState, useCallback, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Settings, ChevronRight, ChevronLeft } from 'lucide-react';

// Enhanced planet data with realistic properties and colors
interface PlanetData {
  size: number;
  distance: number;
  color: string;
  speed: number;
  rotationSpeed: number;
  name: string;
  description: string;
  emissive: string;
  hasRings?: boolean;
}

const PLANET_DATA: Record<string, PlanetData> = {
  mercury: { 
    size: 0.38, 
    distance: 5, 
    color: '#8C7853', 
    speed: 0.048, 
    rotationSpeed: 0.006,
    name: 'Mercury',
    description: 'Closest to the Sun',
    emissive: '#2a2014'
  },
  venus: { 
    size: 0.95, 
    distance: 8, 
    color: '#FFC649', 
    speed: 0.035, 
    rotationSpeed: 0.004,
    name: 'Venus',
    description: 'Hottest planet',
    emissive: '#4a3300'
  },
  earth: { 
    size: 1, 
    distance: 11, 
    color: '#6B93D6', 
    speed: 0.03, 
    rotationSpeed: 0.01,
    name: 'Earth',
    description: 'Our home planet',
    emissive: '#0f1a2e'
  },
  mars: { 
    size: 0.53, 
    distance: 15, 
    color: '#C1440E', 
    speed: 0.024, 
    rotationSpeed: 0.0097,
    name: 'Mars',
    description: 'The Red Planet',
    emissive: '#2e0d03'
  },
  jupiter: { 
    size: 2.2, 
    distance: 21, 
    color: '#D8CA9D', 
    speed: 0.013, 
    rotationSpeed: 0.024,
    name: 'Jupiter',
    description: 'Largest planet',
    emissive: '#3d3627'
  },
  saturn: { 
    size: 1.8, 
    distance: 28, 
    color: '#FAD5A5', 
    speed: 0.0096, 
    rotationSpeed: 0.022,
    name: 'Saturn',
    description: 'Planet with rings',
    emissive: '#3d342a',
    hasRings: true
  },
  uranus: { 
    size: 1.6, 
    distance: 35, 
    color: '#4FD0E7', 
    speed: 0.0068, 
    rotationSpeed: 0.014,
    name: 'Uranus',
    description: 'Ice giant',
    emissive: '#0f3337'
  },
  neptune: { 
    size: 1.55, 
    distance: 42, 
    color: '#4B70DD', 
    speed: 0.0054, 
    rotationSpeed: 0.016,
    name: 'Neptune',
    description: 'Farthest planet',
    emissive: '#0f1837'
  }
};

// Enhanced Sun component with realistic corona effect
function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
    if (coronaRef.current) {
      coronaRef.current.rotation.y += delta * 0.02;
      coronaRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <group>
      {/* Main Sun */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial 
          color="#FDB813"
        />
      </mesh>
      
      {/* Corona effect */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[2.3, 16, 16]} />
        <meshBasicMaterial 
          color="#FFD700" 
          transparent 
          opacity={0.1}
        />
      </mesh>
      
      {/* Sun's glow */}
      <mesh>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial 
          color="#FFA500" 
          transparent 
          opacity={0.05}
        />
      </mesh>
      
      {/* Lighting */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={2} 
        color="#FDB813" 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </group>
  );
}

// Saturn's rings component
function SaturnRings() {
  return (
    <group rotation={[Math.PI / 2 + 0.2, 0, 0]}>
      {/* Inner ring */}
      <mesh>
        <ringGeometry args={[2.2, 2.8, 64]} />
        <meshLambertMaterial 
          color="#C2B280" 
          transparent 
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Middle ring */}
      <mesh>
        <ringGeometry args={[2.9, 3.4, 64]} />
        <meshLambertMaterial 
          color="#D4C5A0" 
          transparent 
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Outer ring */}
      <mesh>
        <ringGeometry args={[3.5, 3.8, 64]} />
        <meshLambertMaterial 
          color="#E6D7B8" 
          transparent 
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Enhanced Planet component with realistic materials
interface PlanetProps {
  data: PlanetData;
  speed: number;
  onClick: () => void;
  onHover: (name: string | null) => void;
}

function Planet({ data, speed, onClick, onHover }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [angle, setAngle] = useState(Math.random() * Math.PI * 2);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (groupRef.current && meshRef.current) {
      // Orbital motion
      setAngle(prev => prev + delta * speed * data.speed);
      groupRef.current.position.x = Math.cos(angle) * data.distance;
      groupRef.current.position.z = Math.sin(angle) * data.distance;
      
      // Planet rotation on its axis
      meshRef.current.rotation.y += delta * data.rotationSpeed;
      
      // Hover effect
      if (hovered) {
        meshRef.current.scale.setScalar(1.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  const handlePointerEnter = useCallback(() => {
    setHovered(true);
    onHover(data.name);
    document.body.style.cursor = 'pointer';
  }, [data.name, onHover]);

  const handlePointerLeave = useCallback(() => {
    setHovered(false);
    onHover(null);
    document.body.style.cursor = 'default';
  }, [onHover]);

  return (
    <>
      {/* Orbit line */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[data.distance - 0.02, data.distance + 0.02, 128]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={hovered ? 0.4 : 0.15} 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Planet group */}
      <group ref={groupRef}>
        <mesh 
          ref={meshRef}
          onClick={onClick}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[data.size, 32, 32]} />
          <meshLambertMaterial 
            color={data.color}
          />
        </mesh>
        
        {/* Add Saturn's rings */}
        {data.hasRings && <SaturnRings />}
        
        {/* Planet label when hovered */}
        {hovered && (
          <Html distanceFactor={15} position={[0, data.size + 1, 0]}>
            <div className="bg-card/90 backdrop-blur-sm border border-border rounded px-2 py-1 text-xs text-foreground font-orbitron">
              {data.name}
            </div>
          </Html>
        )}
      </group>
    </>
  );
}

// Camera controller for smooth transitions
function CameraController({ target, enabled }: { target: THREE.Vector3 | null; enabled: boolean }) {
  const { camera } = useThree();
  
  useFrame(() => {
    if (target && enabled) {
      const idealPosition = new THREE.Vector3(
        target.x + 8, 
        target.y + 8, 
        target.z + 8
      );
      camera.position.lerp(idealPosition, 0.03);
      camera.lookAt(target);
    }
  });
  
  return null;
}

// Enhanced Scene component
interface SceneProps {
  planetSpeeds: Record<string, number>;
  isPaused: boolean;
  selectedPlanet: string | null;
  onPlanetHover: (name: string | null) => void;
  cameraMode: 'free' | 'follow';
}

function Scene({ planetSpeeds, isPaused, selectedPlanet, onPlanetHover, cameraMode }: SceneProps) {
  const [cameraTarget, setCameraTarget] = useState<THREE.Vector3 | null>(null);

  const handlePlanetClick = useCallback((planetName: string, distance: number) => {
    const angle = Math.random() * Math.PI * 2;
    const target = new THREE.Vector3(
      Math.cos(angle) * distance,
      2,
      Math.sin(angle) * distance
    );
    setCameraTarget(target);
    
    // Reset camera after 5 seconds
    setTimeout(() => setCameraTarget(null), 5000);
  }, []);

  return (
    <>
      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.05} color="#1a1a2e" />
      <pointLight position={[0, 0, 0]} intensity={3} color="#FDB813" castShadow />
      <pointLight position={[0, 50, 0]} intensity={0.2} color="#4FD0E7" />
      <pointLight position={[50, 0, 50]} intensity={0.1} color="#C1440E" />
      
      <Sun />
      
      {Object.entries(PLANET_DATA).map(([key, data]) => (
        <Planet
          key={key}
          data={data}
          speed={isPaused ? 0 : planetSpeeds[key] || 1}
          onClick={() => handlePlanetClick(data.name, data.distance)}
          onHover={onPlanetHover}
        />
      ))}
      
      <Stars radius={400} depth={80} count={2000} factor={6} />
      <CameraController target={cameraTarget} enabled={cameraMode === 'follow'} />
      <OrbitControls 
        enabled={cameraMode === 'free'}
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true} 
        minDistance={10}
        maxDistance={100}
      />
    </>
  );
}

// Main Enhanced Solar System component
export default function SolarSystem() {
  const [planetSpeeds, setPlanetSpeeds] = useState(
    Object.keys(PLANET_DATA).reduce((acc, key) => ({ ...acc, [key]: 1 }), {})
  );
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [cameraMode, setCameraMode] = useState<'free' | 'follow'>('free');

  const handleSpeedChange = useCallback((planet: string, speed: number) => {
    setPlanetSpeeds(prev => ({ ...prev, [planet]: speed }));
  }, []);

  const resetAllSpeeds = useCallback(() => {
    setPlanetSpeeds(Object.keys(PLANET_DATA).reduce((acc, key) => ({ ...acc, [key]: 1 }), {}));
  }, []);

  const hoveredPlanetData = useMemo(() => {
    if (!hoveredPlanet) return null;
    const key = Object.keys(PLANET_DATA).find(k => PLANET_DATA[k as keyof typeof PLANET_DATA].name === hoveredPlanet);
    return key ? PLANET_DATA[key as keyof typeof PLANET_DATA] : null;
  }, [hoveredPlanet]);

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden font-space">
      {/* 3D Canvas */}
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-stellar-rotate text-6xl mb-6">🌟</div>
            <h2 className="text-2xl font-orbitron font-bold text-foreground mb-2">
              Initializing Solar System
            </h2>
            <p className="text-muted-foreground">Loading planetary mechanics...</p>
          </div>
        </div>
      }>
        <Canvas
          camera={{ position: [0, 25, 50], fov: 75 }}
          className="w-full h-full"
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
          shadows
        >
          <Scene
            planetSpeeds={planetSpeeds}
            isPaused={isPaused}
            selectedPlanet={null}
            onPlanetHover={setHoveredPlanet}
            cameraMode={cameraMode}
          />
        </Canvas>
      </Suspense>

      {/* Enhanced Control Panel */}
      <div className={`fixed top-4 right-4 transition-transform duration-500 ease-stellar z-20 ${showControls ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="bg-card/85 backdrop-blur-lg border border-border/50 rounded-xl shadow-cosmic overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border/30 bg-gradient-to-r from-primary/10 to-accent/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-orbitron font-bold text-foreground">
                Mission Control
              </h3>
              <button
                onClick={() => setShowControls(!showControls)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted/20"
              >
                {showControls ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>
          </div>

          {/* Main Controls */}
          <div className="p-4 space-y-4">
            {/* Animation Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isPaused 
                    ? 'bg-primary text-primary-foreground shadow-cosmic hover:shadow-stellar' 
                    : 'bg-secondary text-secondary-foreground shadow-stellar hover:shadow-cosmic'
                }`}
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              
              <button
                onClick={resetAllSpeeds}
                className="px-3 py-2 rounded-lg font-medium bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                title="Reset all speeds to 1x"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Camera Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setCameraMode(cameraMode === 'free' ? 'follow' : 'free')}
                className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                  cameraMode === 'follow'
                    ? 'bg-accent text-accent-foreground shadow-nebula'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {cameraMode === 'follow' ? 'Auto Follow' : 'Free Camera'}
              </button>
            </div>

            {/* Speed Controls */}
            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 text-sm font-orbitron font-medium text-foreground">
                <Settings size={14} />
                <span>Orbital Velocities</span>
              </div>
              
              {Object.entries(PLANET_DATA).map(([key, data]) => (
                <div key={key} className="space-y-2 p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{data.name}</span>
                    <span className="text-xs text-muted-foreground font-orbitron tabular-nums">
                      {(planetSpeeds[key] || 1).toFixed(2)}×
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={planetSpeeds[key] || 1}
                    onChange={(e) => handleSpeedChange(key, parseFloat(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((planetSpeeds[key] || 1) / 5) * 100}%, hsl(var(--muted)) ${((planetSpeeds[key] || 1) / 5) * 100}%, hsl(var(--muted)) 100%)`
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Planet Info Display */}
      {hoveredPlanetData && (
        <div className="fixed bottom-4 left-4 bg-card/90 backdrop-blur-lg border border-border/50 rounded-xl p-4 z-10 animate-float shadow-cosmic max-w-xs">
          <h4 className="text-xl font-orbitron font-bold text-foreground mb-2 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: hoveredPlanetData.color }}></span>
            {hoveredPlanetData.name}
          </h4>
          <p className="text-sm text-muted-foreground mb-3">{hoveredPlanetData.description}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Distance:</span>
              <span className="text-foreground font-orbitron">{hoveredPlanetData.distance} AU</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Size:</span>
              <span className="text-foreground font-orbitron">{hoveredPlanetData.size.toFixed(2)}× Earth</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Speed:</span>
              <span className="text-foreground font-orbitron">{(planetSpeeds[Object.keys(PLANET_DATA).find(k => PLANET_DATA[k as keyof typeof PLANET_DATA] === hoveredPlanetData)!] || 1).toFixed(2)}×</span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Overlay */}
      <div className="fixed bottom-4 right-4 bg-card/80 backdrop-blur-md border border-border/50 rounded-xl p-3 z-10 max-w-sm">
        <p className="text-xs text-muted-foreground font-space leading-relaxed">
          🎮 <strong>Controls:</strong> Drag to rotate • Scroll to zoom • Click planets to focus
          <br />
          ⚡ <strong>Features:</strong> Realistic orbits • Dynamic lighting • Interactive speeds
        </p>
      </div>

      {/* Toggle button when controls are hidden */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="fixed top-4 right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-cosmic hover:shadow-stellar transition-all duration-300 z-20"
        >
          <Settings className="animate-stellar-rotate" size={20} />
        </button>
      )}
    </div>
  );
}