import React, { useRef, useState, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

// Planet data with realistic properties
const PLANET_DATA = {
  mercury: { 
    size: 0.4, 
    distance: 4, 
    color: '#8C7853', 
    speed: 0.04, 
    rotationSpeed: 0.01,
    name: 'Mercury'
  },
  venus: { 
    size: 0.9, 
    distance: 7, 
    color: '#FFC649', 
    speed: 0.035, 
    rotationSpeed: 0.008,
    name: 'Venus'
  },
  earth: { 
    size: 1, 
    distance: 10, 
    color: '#6B93D6', 
    speed: 0.03, 
    rotationSpeed: 0.01,
    name: 'Earth'
  },
  mars: { 
    size: 0.5, 
    distance: 13, 
    color: '#C1440E', 
    speed: 0.025, 
    rotationSpeed: 0.009,
    name: 'Mars'
  },
  jupiter: { 
    size: 2.5, 
    distance: 18, 
    color: '#D8CA9D', 
    speed: 0.02, 
    rotationSpeed: 0.02,
    name: 'Jupiter'
  },
  saturn: { 
    size: 2, 
    distance: 24, 
    color: '#FAD5A5', 
    speed: 0.015, 
    rotationSpeed: 0.018,
    name: 'Saturn'
  },
  uranus: { 
    size: 1.5, 
    distance: 30, 
    color: '#4FD0E7', 
    speed: 0.01, 
    rotationSpeed: 0.015,
    name: 'Uranus'
  },
  neptune: { 
    size: 1.4, 
    distance: 36, 
    color: '#4B70DD', 
    speed: 0.008, 
    rotationSpeed: 0.014,
    name: 'Neptune'
  }
};

// Sun component with glow effect
function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial color="#FDB813" />
      <pointLight position={[0, 0, 0]} intensity={2} color="#FDB813" />
      {/* Sun glow effect */}
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial 
          color="#FDB813" 
          transparent 
          opacity={0.1}
        />
      </mesh>
    </mesh>
  );
}

// Planet component
interface PlanetProps {
  data: typeof PLANET_DATA[keyof typeof PLANET_DATA];
  speed: number;
  onClick: () => void;
  onHover: (name: string | null) => void;
}

function Planet({ data, speed, onClick, onHover }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [angle, setAngle] = useState(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    if (groupRef.current && meshRef.current) {
      // Orbital motion
      setAngle(prev => prev + delta * speed * data.speed);
      groupRef.current.position.x = Math.cos(angle) * data.distance;
      groupRef.current.position.z = Math.sin(angle) * data.distance;
      
      // Planet rotation on its axis
      meshRef.current.rotation.y += delta * data.rotationSpeed;
    }
  });

  return (
    <>
      {/* Orbit line - positioned at center */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[data.distance - 0.02, data.distance + 0.02, 64]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.15} 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Planet group */}
      <group ref={groupRef}>
        <mesh 
          ref={meshRef}
          onClick={onClick}
          onPointerEnter={() => onHover(data.name)}
          onPointerLeave={() => onHover(null)}
        >
          <sphereGeometry args={[data.size, 20, 20]} />
          <meshLambertMaterial color={data.color} />
        </mesh>
      </group>
    </>
  );
}

// Camera controls for smooth zoom to planets
function CameraController({ target }: { target: THREE.Vector3 | null }) {
  const { camera } = useThree();
  
  useFrame(() => {
    if (target) {
      camera.position.lerp(
        new THREE.Vector3(target.x + 5, target.y + 5, target.z + 5), 
        0.05
      );
      camera.lookAt(target);
    }
  });
  
  return null;
}

// 3D Scene component
interface SceneProps {
  planetSpeeds: Record<string, number>;
  isPaused: boolean;
  selectedPlanet: string | null;
  onPlanetHover: (name: string | null) => void;
}

function Scene({ planetSpeeds, isPaused, selectedPlanet, onPlanetHover }: SceneProps) {
  const [cameraTarget, setCameraTarget] = useState<THREE.Vector3 | null>(null);

  const handlePlanetClick = useCallback((planetName: string, distance: number) => {
    const angle = Math.random() * Math.PI * 2;
    const target = new THREE.Vector3(
      Math.cos(angle) * distance,
      0,
      Math.sin(angle) * distance
    );
    setCameraTarget(target);
    
    // Reset camera after 3 seconds
    setTimeout(() => setCameraTarget(null), 3000);
  }, []);

  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 0]} intensity={1.5} color="#FDB813" />
      
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
      
      <Stars radius={300} depth={60} count={1000} factor={7} />
      <CameraController target={cameraTarget} />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </>
  );
}

// Main Solar System component
export default function SolarSystem() {
  const [planetSpeeds, setPlanetSpeeds] = useState(
    Object.keys(PLANET_DATA).reduce((acc, key) => ({ ...acc, [key]: 1 }), {})
  );
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);

  const handleSpeedChange = useCallback((planet: string, speed: number) => {
    setPlanetSpeeds(prev => ({ ...prev, [planet]: speed }));
  }, []);

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* 3D Canvas */}
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-stellar-rotate text-4xl mb-4">🌟</div>
            <p className="text-foreground">Loading Solar System...</p>
          </div>
        </div>
      }>
        <Canvas
          camera={{ position: [0, 20, 40], fov: 75 }}
          className="w-full h-full"
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
        >
          <Scene
            planetSpeeds={planetSpeeds}
            isPaused={isPaused}
            selectedPlanet={null}
            onPlanetHover={setHoveredPlanet}
          />
        </Canvas>
      </Suspense>

      {/* Control Panel */}
      <div className={`fixed top-4 right-4 bg-card/80 backdrop-blur-md border border-border rounded-lg p-4 transition-transform duration-300 z-10 ${showControls ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Solar System Controls</h3>
          <button
            onClick={() => setShowControls(!showControls)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {showControls ? '→' : '←'}
          </button>
        </div>

        {/* Pause/Resume */}
        <div className="mb-6">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`w-full px-4 py-2 rounded-md font-medium transition-all duration-200 ${
              isPaused 
                ? 'bg-primary text-primary-foreground shadow-cosmic' 
                : 'bg-secondary text-secondary-foreground shadow-stellar'
            }`}
          >
            {isPaused ? 'Resume' : 'Pause'} Animation
          </button>
        </div>

        {/* Speed Controls */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {Object.entries(PLANET_DATA).map(([key, data]) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center justify-between">
                <span>{data.name}</span>
                <span className="text-xs text-muted-foreground">
                  {planetSpeeds[key]?.toFixed(2)}x
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={planetSpeeds[key] || 1}
                onChange={(e) => handleSpeedChange(key, parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Planet Info Tooltip */}
      {hoveredPlanet && (
        <div className="fixed bottom-4 left-4 bg-card/90 backdrop-blur-md border border-border rounded-lg p-4 z-10 animate-float">
          <h4 className="text-lg font-semibold text-foreground mb-2">{hoveredPlanet}</h4>
          <p className="text-sm text-muted-foreground">
            Click to zoom in • Scroll to zoom • Drag to rotate view
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="fixed bottom-4 right-4 bg-card/80 backdrop-blur-md border border-border rounded-lg p-3 z-10 max-w-xs">
        <p className="text-xs text-muted-foreground">
          🌍 Hover planets for info • Click to zoom • Use controls to adjust speeds
        </p>
      </div>
    </div>
  );
}